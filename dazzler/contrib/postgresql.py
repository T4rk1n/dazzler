import functools
import hashlib
import os
import secrets
import sys
import traceback
import typing
from typing import Any

from aiohttp import web
from precept import Config, ConfigProperty, Nestable

from dazzler.events import DAZZLER_SETUP, DAZZLER_STOP

from dazzler.pages.user_admin import AdminRole, UserAdminPage, AdminUser
from dazzler.system import Middleware as DMiddleware, UNDEFINED
from dazzler.system.auth import Authenticator, User
from dazzler.system.session import SessionBackEnd
from dazzler.tools import replace_all


_sql_formatter = functools.partial(
    replace_all, open_bracket='${', end_bracket='}'
)

_create_session_table_statement = '''
CREATE TABLE  ${schema}.${table} (
    session_id VARCHAR (32) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    data JSONB NOT NULL,
    PRIMARY KEY (session_id)
)
'''
_insert_session_statement = '''
INSERT INTO ${schema}.${table} (session_id, data) VALUES (%s, '{}')
'''

_update_session_statement = '''
UPDATE ${schema}.${table}
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
BEFORE UPDATE ON ${schema}.${table}
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
FROM ${schema}.${table}
WHERE session_id = %s
'''

_delete_session_value_statement = '''
UPDATE ${schema}.${table}
SET data = data - %s
WHERE session_id = %s;
'''

_user_pw_select_statement = '''
select username, password, salt
from ${schema}.${table}
where username = %s and active = true
'''

_get_user_statement = '''
select u.username, u.email, u.metadata, array_agg(r.name) roles
from ${schema}.${user} u
left join ${schema}.${user_roles} ur on u.user_id = ur.user_id
join ${schema}.${role} r on ur.role_id = r.role_id
where u.username = %s
group by u.username, u.email, u.active, u.metadata
'''

_insert_user_statement = '''
insert into ${schema}.${table}
    (username, email, password, salt, metadata)
values (%s, %s, %s, %s, %s);
'''

_create_user_table_statement = '''
create table ${schema}.${table} (
    user_id serial primary key,
    username varchar(100) not null,
    email varchar(256),
    password bytea not null,
    salt bytea not null,
    created_at timestamp default now(),
    updated_at timestamp default now(),
    active bool default true,
    metadata jsonb default '{}'
);
create unique index users_username_idx on ${schema}.${table} (username);
create unique index users_email_idx on ${schema}.${table} (email);
'''

_create_role_table_statement = '''
create table ${schema}.${table} (
    role_id serial primary key,
    name varchar(100) not null,
    description text
);
create unique index role_name_idx on ${schema}.${table} (name);
'''

_create_user_roles_table_statement = '''
create table ${schema}.${user_roles} (
    role_id int not null,
    user_id int not null,

    primary key (role_id, user_id),
    constraint role_id_fk foreign key (role_id)
        references ${schema}.${role}(role_id) on delete cascade,
    constraint username_fk foreign key (user_id)
        references ${schema}.${users}(user_id) on delete cascade
);
'''
_insert_role_statement = '''
insert into ${schema}.${table} (name, description) values (%s, %s)
'''
_insert_user_role_statement = '''
insert into ${schema}.${user_roles} (role_id, user_id)
values (
    (select role_id from ${schema}.${role} where name = %s),
    (select user_id from ${schema}.${users} where username = %s)
)
'''

_admin_get_users_statement = '''
select u.username, u.active, array_agg(r.name)
from ${schema}.${users} u
left join ${schema}.${user_roles} ur on u.user_id= ur.user_id
left join ${schema}.${role} r on ur.role_id = r.role_id
${where}
group by u.username, u.created_at, u.active
order by u.created_at
limit %s offset %s
'''

_admin_get_users_count_statement = '''
select count(distinct u.user_id)
from ${schema}.${users} u
left join ${schema}.${user_roles} ur on u.user_id = ur.user_id
left join ${schema}.${role} r on ur.role_id = r.role_id
${where}
'''

_admin_get_roles_statement = '''
select name, description from ${schema}.${table}
'''
_admin_insert_role_statement = '''
insert into ${schema}.${table} (name, description)
values (%s, %s)
returning role_id
'''
_admin_delete_role_statement = '''
delete from ${schema}.${table}
where name = %s
'''
_admin_update_active_user_statement = '''
update ${schema}.${table} set active = %s where username  = %s
'''

_admin_delete_user_roles_statement = '''
delete from ${schema}.${user_roles}
where role_id not in (
    select role_id
    from ${schema}.${role}
    where name = any(%s)
)
and user_id = (select user_id from ${schema}.${users} where username = %s)
'''
_admin_insert_user_roles_statement = '''
with user_to_edit (cur_user_id) as (
    select user_id
    from ${schema}.${users}
    where username = %s
)
insert into ${schema}.${user_roles}
    select r.role_id, cur_user_id
    from ${schema}.${role} r, user_to_edit
    where r.role_id in (
        select sr.role_id
        from ${schema}.${role} sr
        where sr.name = any (%s)
    ) and r.role_id not in (
        select role_id
        from ${schema}.${user_roles}
        where user_id = cur_user_id
    )
;
'''
_admin_delete_user_statement = '''
delete from ${schema}.${table} where username = %s
'''
_admin_update_role_description_statement = '''
update ${schema}.${table} set description = %s where name = %s
'''


def _add_where(statement):
    if not statement.startswith('WHERE'):
        return 'WHERE'
    return ' AND'


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


async def _get_pool_from_app(app, config: PostgresConfig):
    if config.postgres.middleware.app_key in app.server.app:
        return app.server.app[
            config.postgres.middleware.app_key
        ]
    return await get_postgres_pool(config)


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
    Session backend for PostgreSQL.

    :Tables:
        - ``session``

    :Configuration:
        .. code-block:: toml

            [session]
            backend = 'PostgreSQL'

    :type pool: aiopg.Pool
    """
    def __init__(self, app, config: PostgresConfig = None, pool=None):
        super().__init__(app)
        if not config:
            config = PostgresConfig()
            if app.config_path:
                config.read_file(app.config_path)
        self.config = config
        self.pool = pool
        from psycopg2.extras import Json
        self._json = Json
        self._insert_statement = _sql_formatter(
            _insert_session_statement,
            schema=config.postgres.session.schema_name,
            table=config.postgres.session.table_name,
        )
        self._update_statement = _sql_formatter(
            _update_session_statement,
            schema=config.postgres.session.schema_name,
            table=config.postgres.session.table_name,
        )
        self._get_statement = _sql_formatter(
            _get_session_value_statement,
            schema=config.postgres.session.schema_name,
            table=config.postgres.session.table_name,
        )
        self._delete_statement = _sql_formatter(
            _delete_session_value_statement,
            schema=config.postgres.session.schema_name,
            table=config.postgres.session.table_name,
        )
        app.events.subscribe(DAZZLER_SETUP, self._setup)

    async def _setup(self, _):
        conf = self.config
        if not self.pool:
            self.pool = await _get_pool_from_app(self.app, conf)

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
                        _sql_formatter(
                            _create_session_table_statement,
                            schema=conf.postgres.session.schema_name,
                            table=conf.postgres.session.table_name,
                        ),
                    )
                    await cursor.execute(_trigger_func_statement)
                    await cursor.execute(
                        _sql_formatter(
                            _trigger_statement,
                            schema=conf.postgres.session.schema_name,
                            table=conf.postgres.session.table_name,
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
    Authenticator for PostgreSQL.

    Encryption of user passwords with scrypt.

    :Tables:
        - ``users``
        - ``role``
        - ``user_roles``

    :Configuration:
        .. code-block:: toml

            [authentication]
            authenticator = 'dazzler.contrib.postgresql:PostgresAuthenticator'

            [postgres]
            dsn = 'host=localhost port=5432 dbname=mydb'

            [postgres.auth]
            schema_name = 'public'
            user_table_name = 'users'

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
        self._get_user_statement = _sql_formatter(
            _get_user_statement,
            schema=config.postgres.auth.schema_name,
            user=config.postgres.auth.user_table_name,
            user_roles=config.postgres.auth.user_roles_table_name,
            role=config.postgres.auth.role_table_name,
        )
        self._insert_user_statement = _sql_formatter(
            _insert_user_statement,
            schema=config.postgres.auth.schema_name,
            table=config.postgres.auth.user_table_name,
        )
        self._get_user_pw_statement = _sql_formatter(
            _user_pw_select_statement,
            schema=config.postgres.auth.schema_name,
            table=config.postgres.auth.user_table_name,
        )
        self._insert_role_statement = _sql_formatter(
            _insert_role_statement,
            schema=config.postgres.auth.schema_name,
            table=config.postgres.auth.role_table_name,
        )
        self._insert_user_roles_statement = _sql_formatter(
            _insert_user_role_statement,
            schema=config.postgres.auth.schema_name,
            user_roles=config.postgres.auth.user_roles_table_name,
            role=config.postgres.auth.role_table_name,
            users=config.postgres.auth.user_table_name,
        )
        app.events.subscribe(DAZZLER_SETUP, self.setup)

    async def setup(self, _):
        conf = self.config.postgres
        if not self.pool:
            self.pool = await _get_pool_from_app(self.app, self.config)

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
                    _sql_formatter(
                        _create_user_table_statement,
                        schema=conf.auth.schema_name,
                        table=conf.auth.user_table_name,
                    ),
                )
                await cursor.execute(
                    _sql_formatter(
                        _trigger_statement,
                        schema=conf.auth.schema_name,
                        table=conf.auth.user_table_name,
                    ),
                )
                await cursor.execute(
                    _sql_formatter(
                        _create_role_table_statement,
                        schema=conf.auth.schema_name,
                        table=conf.auth.role_table_name
                    )
                )
                await cursor.execute(
                    _sql_formatter(
                        _create_user_roles_table_statement,
                        schema=conf.auth.schema_name,
                        user_roles=conf.auth.user_roles_table_name,
                        users=conf.auth.user_table_name,
                        role=conf.auth.role_table_name,
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


class PostgresUserAdminPage(UserAdminPage):
    """
    Implementation of UserAdminPage for PostgreSQL.

    :Configuration:
        .. code-block:: toml

            [authentication.admin]
            enable = true
            page_ref = 'dazzler.contrib.postgresql:PostgresUserAdminPage'

    :type pool: aiopg.Pool
    """

    def __init__(self, app, config: PostgresConfig = None, **kwargs):
        super().__init__(app, **kwargs)
        self.config = config
        if not config:
            self.config = config = PostgresConfig()
            if app.config_path:
                self.config.read_file(app.config_path)
        self.pool = None
        self._get_users_statement = _sql_formatter(
            _admin_get_users_statement,
            schema=config.postgres.auth.schema_name,
            users=config.postgres.auth.user_table_name,
            role=config.postgres.auth.role_table_name,
            user_roles=config.postgres.auth.user_roles_table_name,
        )
        self._get_user_count_statement = _sql_formatter(
            _admin_get_users_count_statement,
            schema=config.postgres.auth.schema_name,
            users=config.postgres.auth.user_table_name,
            role=config.postgres.auth.role_table_name,
            user_roles=config.postgres.auth.user_roles_table_name,
        )
        self._get_roles_statement = _sql_formatter(
            _admin_get_roles_statement,
            schema=config.postgres.auth.schema_name,
            table=config.postgres.auth.role_table_name,
        )
        self._update_active_user_statement = _sql_formatter(
            _admin_update_active_user_statement,
            schema=config.postgres.auth.schema_name,
            table=config.postgres.auth.user_table_name,
        )
        self._insert_role_statement = _sql_formatter(
            _admin_insert_role_statement,
            schema=config.postgres.auth.schema_name,
            table=config.postgres.auth.role_table_name,
        )
        self._delete_role_statement = _sql_formatter(
            _admin_delete_role_statement,
            schema=config.postgres.auth.schema_name,
            table=config.postgres.auth.role_table_name,
        )
        self._delete_user_roles_statement = _sql_formatter(
            _admin_delete_user_roles_statement,
            schema=config.postgres.auth.schema_name,
            user_roles=config.postgres.auth.user_roles_table_name,
            role=config.postgres.auth.role_table_name,
            users=config.postgres.auth.user_table_name,
        )
        self._insert_user_roles_statement = _sql_formatter(
            _admin_insert_user_roles_statement,
            schema=config.postgres.auth.schema_name,
            user_roles=config.postgres.auth.user_roles_table_name,
            role=config.postgres.auth.role_table_name,
            users=config.postgres.auth.user_table_name,
        )
        self._delete_user_statement = _sql_formatter(
            _admin_delete_user_statement,
            schema=config.postgres.auth.schema_name,
            table=config.postgres.auth.user_table_name,
        )
        self._update_role_description_statement = _sql_formatter(
            _admin_update_role_description_statement,
            schema=config.postgres.auth.schema_name,
            table=config.postgres.auth.role_table_name,
        )

    async def setup(self, _):
        if not self.pool:
            self.pool = await _get_pool_from_app(self.app, self.config)

    @staticmethod
    def _build_user_filter(filters):
        where = ''
        args = []

        if filters:
            username = filters.get('username')
            if username:
                where = 'WHERE u.username ~* %s'
                args.append(username)
            user_roles = filters.get('user_roles')
            if user_roles and len(user_roles):
                where += _add_where(where) + ' r.name = any(%s)'
                args.append(user_roles)
            active = filters.get('active', UNDEFINED)
            if active is not UNDEFINED:
                where += _add_where(where) + ' u.active = %s'
                args.append(active)
        return where, args

    async def get_users(self, offset, limit, filters=None):
        where, args = self._build_user_filter(filters)
        statement = _sql_formatter(self._get_users_statement, where=where)
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    statement,
                    args + [limit, offset]
                )
                return [
                    AdminUser(x[0], x[1], [y for y in x[2] if y]) for x in
                    await cursor.fetchall()
                ]

    async def get_user_count(self, filters=None):
        where, args = self._build_user_filter(filters)
        statement = _sql_formatter(self._get_user_count_statement, where=where)
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(statement, args)
                result = await cursor.fetchone()
                return result[0]

    async def get_roles(self):
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(self._get_roles_statement)
                return [
                    AdminRole(*role)
                    for role in await cursor.fetchall()
                ]

    async def toggle_active_user(self, username: str, active: bool):
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    self._update_active_user_statement,
                    [active, username]
                )

    async def change_user_roles(self, username: str, roles: typing.List[str]):
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    self._delete_user_roles_statement,
                    [roles, username]
                )
                await cursor.execute(
                    self._insert_user_roles_statement,
                    [username, roles]
                )

    async def delete_user(self, username: str):
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    self._delete_user_statement, [username]
                )

    async def create_role(self, role: str, description: str):
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    self._insert_role_statement,
                    [role, description or None]
                )

    async def delete_role(self, role: str):
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    self._delete_role_statement,
                    [role]
                )

    async def update_role_description(self, role: str, description: str):
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    self._update_role_description_statement,
                    [description, role]
                )
