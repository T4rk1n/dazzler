from typing import Any

from aiohttp import web
from precept import Config, ConfigProperty, Nestable

from dazzler.events import DAZZLER_SETUP
from dazzler.system import Middleware as DMiddleware
from dazzler.system.session import SessionBackEnd
from dazzler.tools import replace_all

_table_create_statement = '''
CREATE TABLE %(schema_name).%(table_name) (
    session_id VARCHAR (32) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    data JSONB NOT NULL,
    PRIMARY KEY (session_id)
)
'''
_insert_statement = '''
INSERT INTO %(schema_name).%(table_name) (session_id, data) VALUES (%s, '{}')
'''

_update_statement = '''
UPDATE %(schema_name).%(table_name)
SET data = jsonb_set(data, %s, %s, true)
WHERE session_id = %s;
'''

_trigger_func_statement = '''
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
'''
_trigger_statement = '''
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON %(schema_name).%(table_name)
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();
'''

_table_exists_statement = '''
SELECT EXISTS(
    SELECT * FROM information_schema.tables
    WHERE table_schema = %s AND table_name = %s
);
'''

_get_session_value_statement = '''
SELECT data -> %s
FROM %(schema_name).%(table_name)
WHERE session_id = %s
'''

_delete_session_value_statement = '''
UPDATE %(schema_name).%(table_name)
SET data = data - %s
WHERE session_id = %s;
'''


class PostgresConfig(Config):
    class Postgres(Nestable):
        dsn = ConfigProperty(
            default='',
            auto_environ=True,
            environ_name='POSTGRES_DSN'
        )

        class Session(Nestable):
            table_name = ConfigProperty(
                default='session',
                auto_environ=True,
                environ_name='POSTGRES_SESSION_TABLE'
            )
            schema_name = ConfigProperty(
                default='public',
                auto_environ=True,
                environ_name='POSTGRES_SESSION_SCHEMA'
            )

        session: Session

        class Pool(Nestable):
            minsize = ConfigProperty(
                default=1,
            )
            maxsize = ConfigProperty(
                default=10,
            )

        pool: Pool

        class Middleware(Nestable):
            request_key = ConfigProperty(default='postgres')
            app_key = ConfigProperty(default='postgres')

        middleware: Middleware

    postgres: Postgres


async def get_postgres_pool(config: PostgresConfig):
    import aiopg
    pool = await aiopg.create_pool(
        dsn=config.postgres.dsn,
        minsize=config.postgres.pool.minsize,
        maxsize=config.postgres.pool.maxsize,
    )
    return pool


class PostgresMiddleware(DMiddleware):
    def __init__(self, app, config: PostgresConfig, pool=None):
        self.app = app
        self.config = config
        self.pool = pool
        app.events.subscribe(DAZZLER_SETUP, self._setup)

    async def _setup(self, _):
        if not self.pool:
            self.pool = await get_postgres_pool(self.config)
        self.app.server.app[
            self.config.postgres.middleware.app_key
        ] = self.pool

    async def __call__(self, request: web.Request):
        request[self.config.postgres.middleware.request_key] = self.pool


class PostgresSessionBackend(SessionBackEnd):
    """
    :type pool: aiopg.Pool
    """
    def __init__(self, app, config: PostgresConfig, pool=None):
        super().__init__(app)
        self.config = config
        self.pool = pool
        from psycopg2.extras import Json
        self._json = Json
        self._insert_statement = replace_all(
            _insert_statement,
            schema_name=config.postgres.session.schema_name,
            table_name=config.postgres.session.table_name,
        )
        self._update_statement = replace_all(
            _update_statement,
            schema_name=config.postgres.session.schema_name,
            table_name=config.postgres.session.table_name,
        )
        self._get_statement = replace_all(
            _get_session_value_statement,
            schema_name=config.postgres.session.schema_name,
            table_name=config.postgres.session.table_name,
        )
        self._delete_statement = replace_all(
            _delete_session_value_statement,
            schema_name=config.postgres.session.schema_name,
            table_name=config.postgres.session.table_name,
        )
        app.events.subscribe(DAZZLER_SETUP, self._setup)

    async def _setup(self, _):
        conf = self.config
        if not self.pool:
            if conf.postgres.middleware.app_key in self.app.server.app:
                self.pool = self.app.server.app[
                    conf.postgres.middleware.app_key
                ]
            self.pool = await get_postgres_pool(conf)

        async with self.pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    _table_exists_statement,
                    [
                        conf.postgres.session.schema_name,
                        conf.postgres.session.table_name,
                    ]
                )
                exists = await cursor.fetchone()
                if not exists[0]:
                    self.app.logger.debug('Create session table.')
                    await cursor.execute(
                        replace_all(
                            _table_create_statement,
                            schema_name=conf.postgres.session.schema_name,
                            table_name=conf.postgres.session.table_name,
                        ),
                    )
                    await cursor.execute(_trigger_func_statement)
                    await cursor.execute(
                        replace_all(
                            _trigger_statement,
                            schema_name=conf.postgres.session.schema_name,
                            table_name=conf.postgres.session.table_name,
                        ),
                    )

    async def set(self, session_id: str, key: str, value: Any):
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cursor:
                try:
                    self.app.logger.debug(
                        f'Set session {session_id}: {key}: {value}')
                    await cursor.execute(
                        self._update_statement,
                        [
                            [key],
                            self._json(value),
                            session_id
                        ]
                    )
                except Exception as err:
                    self.app.logger.exception(err)
                    raise err

    async def get(self, session_id: str, key: str):
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cursor:
                try:
                    await cursor.execute(
                        self._get_statement,
                        [key, session_id]
                    )
                    value = await cursor.fetchone()
                    if value:
                        return value[0]
                except Exception as err:
                    self.app.logger.exception(err)
                    raise err

    async def delete(self, session_id: str, key: str):
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cursor:
                try:
                    await cursor.execute(
                        self._delete_statement,
                        [key, session_id]
                    )
                except Exception as err:
                    self.app.logger.exception(err)
                    raise err

    async def on_new_session(self, session_id: str):
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cursor:
                try:
                    await cursor.execute(
                        self._insert_statement,
                        [session_id]
                    )
                except Exception as err:
                    self.app.logger.exception(err)
                    raise err
