import hashlib
import os
import secrets
import sys
import traceback
from typing import Any

from aiohttp import web
from precept import Config, ConfigProperty, Nestable

from dazzler.events import DAZZLER_SETUP, DAZZLER_STOP
from dazzler.system import Middleware as DMiddleware, UNDEFINED
from dazzler.system.auth import Authenticator, User
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

_user_pw_select_statement = '''
select username, password, salt
from %(schema_name).%(table_name)
where username = %s and active = true
'''

_get_user_statement = '''
select u.username, u.email, u.metadata, array_agg(r.name) roles
from %(schema).%(user) u
join %(schema).%(user_roles) ur on u.username = ur.username
join %(schema).%(role) r on ur.role_id = r.role_id
where u.username = %s
group by u.username, u.email, u.active, u.metadata
'''

_insert_user_statement = '''
insert into %(schema_name).%(table_name)
    (username, email, password, salt, metadata)
values (%s, %s, %s, %s, %s);
'''

_create_user_table_statement = '''
create table %(schema_name).%(table_name) (
    username varchar(100) primary key,
    email varchar(256),
    password bytea not null,
    salt bytea not null,
    created_at timestamp default now(),
    updated_at timestamp default now(),
    active bool default true,
    metadata jsonb default '{}'
);
create unique index users_email_idx on %(schema_name).%(table_name) (email);
'''

_create_role_table_statement = '''
create table %(schema_name).%(table_name) (
    role_id serial primary key,
    name varchar(32) not null,
    description text
);
create unique index role_name_idx on %(schema_name).%(table_name) (name);
'''

_create_user_roles_table_statement = '''
create table %(schema_name).%(table_name) (
    role_id int not null,
    username varchar(100) not null,

    primary key (role_id, username)
);
'''
_insert_role_statement = '''
insert into %(schema_name).%(table_name) (name, description) values (%s, %s)
'''
_insert_user_role_statement = '''
insert into %(schema_name).%(table_name) (role_id, username)
values (
    (select role_id from %(schema_name).%(role_table) where name = %s),
    %s
)
'''


def _get_statement_for_schema_table(template, schema_name, table_name):
    return replace_all(
        template,
        schema_name=schema_name,
        table_name=table_name,
    )


async def _table_exists(cursor, schema, table):
    await cursor.execute(_table_exists_statement, [schema, table])
    result = await cursor.fetchone()
    if result:
        return result[0]


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

        class Auth(Nestable):
            schema_name = ConfigProperty(
                default='public',
                auto_environ=True,
                environ_name='POSTGRES_AUTH_SCHEMA'
            )
            user_table_name = ConfigProperty(
                default='users',
                auto_environ=True,
                environ_name='POSTGRES_USER_TABLE'
            )
            role_table_name = ConfigProperty(
                default='role',
                auto_environ=True,
                environ_name='POSTGRES_ROLE_TABLE'
            )
            user_roles_table_name = ConfigProperty(
                default='user_roles',
                auto_environ=True,
                environ_name='POSTGRES_USER_ROLES_TABLE'
            )
            roles = ConfigProperty(
                default=['admin', 'user'],
                config_type=list,
            )
            default_user_roles = ConfigProperty(
                default=['user'],
                config_type=list,
            )

            class Encryption(Nestable):
                cost_factor = ConfigProperty(default=128)
                blocksize = ConfigProperty(default=64)
                parallelism = ConfigProperty(default=1)
                maxmem = ConfigProperty(default=0)
                dklen = ConfigProperty(default=64)

            encryption: Encryption

        auth: Auth

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
    """
    :type pool: aiopg.Pool
    """
    def __init__(self, app, config: PostgresConfig, pool=None):
        self.app = app
        self.config = config
        self.pool = pool
        app.events.subscribe(DAZZLER_SETUP, self._setup)
        app.events.subscribe(DAZZLER_STOP, self._cleanup)

    async def _setup(self, _):
        if not self.pool:
            self.pool = await get_postgres_pool(self.config)
        self.app.server.app[
            self.config.postgres.middleware.app_key
        ] = self.pool

    async def _cleanup(self, _):
        self.pool.close()
        await self.pool.wait_closed()

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
        self._insert_statement = _get_statement_for_schema_table(
            _insert_statement,
            config.postgres.session.schema_name,
            config.postgres.session.table_name,
        )
        self._update_statement = _get_statement_for_schema_table(
            _update_statement,
            config.postgres.session.schema_name,
            config.postgres.session.table_name,
        )
        self._get_statement = _get_statement_for_schema_table(
            _get_session_value_statement,
            config.postgres.session.schema_name,
            config.postgres.session.table_name,
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
            else:
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
                        v = value[0]
                        if v is None:
                            return UNDEFINED
                        return v
                except Exception as err:
                    self.app.logger.exception(err)
                    raise err

        return UNDEFINED

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


class PostgresAuthenticator(Authenticator):
    """
    :type pool: aiopg.Pool
    """
    def __init__(self, app, pool=None):
        super().__init__(app)
        config = PostgresConfig()
        if os.path.exists(app.config_path):
            config.read_file(app.config_path)

        if not any(isinstance(x, PostgresMiddleware) for x in app.middlewares):
            # Using another session backend, need to insert the middleware.
            app.middlewares.insert(
                0, PostgresMiddleware(app, config, pool)
            )
        self.config = config
        self.pool = pool
        from psycopg2.extras import Json, NamedTupleCursor
        self._json = Json
        self._cursor_factory = NamedTupleCursor
        self._get_user_statement = replace_all(
            _get_user_statement,
            schema=config.postgres.auth.schema_name,
            user=config.postgres.auth.user_table_name,
            user_roles=config.postgres.auth.user_roles_table_name,
            role=config.postgres.auth.role_table_name,
        )
        self._insert_user_statement = replace_all(
            _insert_user_statement,
            schema_name=config.postgres.auth.schema_name,
            table_name=config.postgres.auth.user_table_name,
        )
        self._get_user_pw_statement = replace_all(
            _user_pw_select_statement,
            schema_name=config.postgres.auth.schema_name,
            table_name=config.postgres.auth.user_table_name,
        )
        self._insert_role_statement = replace_all(
            _insert_role_statement,
            schema_name=config.postgres.auth.schema_name,
            table_name=config.postgres.auth.role_table_name,
        )
        self._insert_user_roles_statement = replace_all(
            _insert_user_role_statement,
            schema_name=config.postgres.auth.schema_name,
            table_name=config.postgres.auth.user_roles_table_name,
            role_table=config.postgres.auth.role_table_name,
        )
        app.events.subscribe(DAZZLER_SETUP, self.setup)

    async def setup(self, _):
        conf = self.config.postgres
        if not self.pool:
            if not self.pool:
                if conf.middleware.app_key in self.app.server.app:
                    self.pool = self.app.server.app[
                        conf.middleware.app_key
                    ]
                else:
                    self.pool = await get_postgres_pool(self.config)

        # setup tables
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cursor:
                exists = await _table_exists(
                    cursor, conf.auth.schema_name, conf.auth.user_table_name
                )
                if exists:
                    return
                self.app.logger.debug(
                    f'Creating auth tables, schema: {conf.auth.schema_name}'
                )
                await cursor.execute(_trigger_func_statement)
                await cursor.execute(
                    replace_all(
                        _create_user_table_statement,
                        schema_name=conf.auth.schema_name,
                        table_name=conf.auth.user_table_name,
                    ),
                )
                await cursor.execute(
                    replace_all(
                        _create_role_table_statement,
                        schema_name=conf.auth.schema_name,
                        table_name=conf.auth.role_table_name
                    )
                )
                await cursor.execute(
                    replace_all(
                        _create_user_roles_table_statement,
                        schema_name=conf.auth.schema_name,
                        table_name=conf.auth.user_roles_table_name
                    )
                )
                self.app.logger.debug(
                    f'Creating user roles: {conf.auth.roles}'
                )
                # Seems there is no support for executemany in aiopg
                for role in conf.auth.roles:
                    await cursor.execute(
                        self._insert_role_statement,
                        [role, f'default {role} role']
                    )

    async def authenticate(self, username: str, password: str):
        async with self.pool.acquire() as conn:
            async with conn.cursor(
                cursor_factory=self._cursor_factory
            ) as cursor:
                await cursor.execute(
                    self._get_user_pw_statement, [username]
                )
                userdata = await cursor.fetchone()
                if not userdata:
                    return

                encrypted = await self.app.executor.execute(
                    hashlib.scrypt,
                    password.encode(),
                    n=128, r=64, p=1,
                    salt=userdata.salt
                )
                valid = secrets.compare_digest(encrypted, userdata.password)
                if valid:
                    # this only set the session,
                    # no need for the other attributes
                    return User(username)

    async def get_user(self, username: str):
        if not username:
            return
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(self._get_user_statement, [username])
                userdata = await cursor.fetchone()
                return User(
                    username,
                    email=userdata[1],
                    metadata=userdata[2],
                    roles=userdata[3],
                )

    async def register_user(
        self,
        username: str,
        password: str,
        email: str = None,
        fields: dict = None,
    ):
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cursor:
                try:
                    salt = self._gen_salt()
                    encrypted = await self._encrypt(password.encode(), salt)
                    await cursor.execute(
                        self._insert_user_statement,
                        [
                            username, email,
                            encrypted, salt,
                            self._json(fields or {})
                        ]
                    )
                    for role in self.config.postgres.auth.default_user_roles:
                        await cursor.execute(
                            self._insert_user_roles_statement,
                            [role, username]
                        )
                    return None
                except Exception as err:  # pylint: disable=broad-except
                    self.app.logger.exception(err)
                    return traceback.format_exc()

    @staticmethod
    def _gen_salt():
        return secrets.randbits(128).to_bytes(16, sys.byteorder)

    async def _encrypt(
        self, value: bytes, salt: bytes
    ):
        return await self.app.executor.execute(
            hashlib.scrypt,
            value,
            salt=salt,
            n=self.config.postgres.auth.encryption.cost_factor,
            r=self.config.postgres.auth.encryption.blocksize,
            p=self.config.postgres.auth.encryption.parallelism,
            maxmem=self.config.postgres.auth.encryption.maxmem,
            dklen=self.config.postgres.auth.encryption.dklen,
        )
