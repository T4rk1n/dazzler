.. auth_usage:

Auth Usage
==========

The auth system of dazzler provide components and routes to integrate
with your authentication protocol. Pages marked as ``require_login`` will
show a login page if not authenticated.

The auth routes are under `/auth/` and used with components:
- ``auth.Login(login_url='/auth/login')``
- ``auth.Logout(logout_url='/auth/logout')``

The default backend is integrated with the session system and can be
changed via configs.

To use the system, you need to subclass ``dazzler.system.auth.Authenticator``
and implement the ``authenticate`` and ``get_user`` methods.

If a user is authenticated, it will be available in bindings via ``context.user``
and for regular aiohttp routes in ``request['user']``.

Sqlite Example
--------------

Using hashlib scrypt and sqlite, you can easily implement an auth flow to work
with your application.

Setup
^^^^^

`Scrypt`_ requires OpenSSL 1.1+ installed.

Database
""""""""

Create a sqlite database with the following schema:

.. code-block:: sql

    CREATE TABLE UserAccount (
        username VARCHAR (64) PRIMARY KEY,
        email    TEXT,
        password BLOB NOT NULL,
        salt     BLOB NOT NULL
    );

.. note::
    Run ``$ sqlite3 db.sqlite`` to create the database and paste the table
    statement into the interactive client.


Create a Python db object for sqlite and an asyncio Lock to access the database
from multiple endpoints.

For convenience, we can automatically map the fetch results column names to
values with the cursor description.

.. code-block:: python
    :caption: db.py

    import asyncio
    import sqlite3


    class DB:
        database_file = 'db.sqlite'

        def __init__(self):
            self.lock = asyncio.Lock()
            self.conn = sqlite3.connect(self.database_file)

        async def execute(self, statement, *parameters):
            async with self.lock:
                return self.conn.execute(statement, parameters)

        async def fetch(self, statement, *parameters):
            async with self.lock:
                cursor = self.conn.execute(statement, parameters)
                results = cursor.fetchall()
                cursor.close()

                # Map the name of the columns with the values.
                return [
                    {d[0]: x[i] for i, d in enumerate(cursor.description)}
                    for x in results
                ]


    db = DB()

.. warning::
    While the db object will work for fast development, it is not recommended
    for a production environment. You should use a proper database.

Configurations
""""""""""""""

Enable the auth module and provide a path to the Authenticator in the
configs:

.. code-block:: toml
    :caption: dazzler.toml

    ...
    [authentication]
    enable = True
    # Path to an instance or subclass of `dazzler.system.auth.Authenticator`
    authenticator = "auth:SqliteAuthenticator"
    ...

.. note::
    Generate a config file with ``dazzler dump-configs dazzler.toml``

Authenticator
^^^^^^^^^^^^^

Implement the authenticator methods, since they both use the same data, we
can extract the user fetch. The
:py:meth:`~.dazzler.system.auth.Authenticator.get_user` method is only called
when the user is saved by the auth backend.

.. code-block:: python
    :caption: auth.py

    import hashlib
    import secrets
    from dazzler.system.auth import Authenticator, User

    from .db import db


    class SqliteAuthenticator(Authenticator):

        async def _get_user(self, username):
            users = await db.fetch(
                'SELECT * FROM UserAccount WHERE username=$1', username
            )
            if len(users):
                return users[0]

        async def authenticate(self, username: str, password: str):
            userdata = await self._get_user(username)

            if not userdata:
                return  # User doesn't exist, return None to fail the process

            # Execute in a thread to prevent blocking the server since it takes
            # some time to hash password for a secure process.
            encrypted = await self.app.executor.execute(
                hashlib.scrypt,
                password.encode(),
                n=128, r=64, p=1,
                salt=userdata['salt']
            )
            valid = secrets.compare_digest(
                encrypted, userdata['password']
            )

            if valid:
                # Return a User instance that will be saved by the auth backend.
                return User(username)


        async def get_user(self, username: str) -> User:
            userdata = await self._get_user(username)
            return User(userdata['username'])


Registering users
^^^^^^^^^^^^^^^^^

While dazzler auth doesn't come with a ready made component for registering
users like it does for login & logout, you can make a simple form page using
the :py:class:`~.dazzler.components.core.Form` core component.

For each individual user, we create a unique salt that will be used to hash
the password, creating unique hashes for same passphrases.


.. code-block:: python
    :caption: register.py

    import hashlib
    import secrets
    import sys

    from aiohttp import web
    from dazzler.system import Page, RouteMethod
    from dazzler.components import core
    from dazzler.system.auth import User

    from .db import db

    page = Page(
        __name__,
        core.Container(
            core.Form(
                fields=[
                    {
                        'label': 'Username',
                        'name': 'username',
                        'type': 'text',
                    },
                    {
                        'label': 'Email',
                        'name': 'email',
                        'type': 'text',
                    },
                    {
                        'label': 'Password',
                        'name': 'password',
                        'type': 'password',
                    }
                ],
                header=core.Html('h2', 'Register'),
                action='/register/submit',
                method='post',
                identity='register-form',
                class_name='df-form',
                style={'width': '60%'}
            ),
            class_name='row center'
        )
    )


    @page.route('/submit', method=RouteMethod.POST)
    async def route_register_post(request: web.Request):
        data = await request.post()

        app = request.app['dazzler']

        salt = secrets.randbits(128).to_bytes(16, sys.byteorder)

        encrypted = await app.executor.execute(
            hashlib.scrypt,
            data["password"].encode(),
            n=128, r=64, p=1,
            salt=salt
        )

        cur = await db.execute(
            "INSERT INTO UserAccount VALUES ($1,$2,$3,$4)",
            data['username'],
            data['email'],
            encrypted,
            salt
        )
        cur.close()
        db.conn.commit()

        # After insertion you can login with the auth backend
        response = web.HTTPSeeOther(
            location=request.app.router['home'].url_for(),
        )
        await request.app['dazzler'].auth.backend.login(
            User(data['username']), request, response
        )
        raise response


.. seealso::
    - `Scrypt`_
    - `Salt`_

Auth components
^^^^^^^^^^^^^^^

Home page shows a login or username with logout:

.. code-block:: python
    :caption: home.py

    from dazzler.components import core, auth
    from dazzler.system import Page, BindingContext

    page = Page(
        __name__,
        core.Container(
            [
                core.Html('h1', 'Home'),
                core.Container(identity='auth', class_name='auth')
            ],
            class_name='column',
            style={'justifyContent': 'center', 'alignItems': 'center'}
        ),
        url='/'
    )


    @page.bind('class_name@auth')
    async def on_load(ctx: BindingContext):
        if ctx.user:
            await ctx.set_aspect(
                'auth',
                children=[
                    f'Welcome {ctx.user.username}',
                    auth.Logout('/auth/logout')
                ]
            )
        else:
            await ctx.set_aspect(
                'auth',
                children=[
                    auth.Login('/auth/login'),
                    core.Container(
                        core.Link('register'),
                        class_name='column',
                        style={
                            'justifyContent': 'center',
                            'alignItems': 'center',
                            'padding': '0.5rem'
                        }
                    )
                ]
            )


Customizing user data
^^^^^^^^^^^^^^^^^^^^^

Subclass :py:class:`~.dazzler.system.auth.User` and
return an instance in the Authenticator
:py:meth:`~.dazzler.system.auth.Authenticator.get_user` method.


.. code-block:: python
    :caption: auth_user.py

    from dazzler.system.auth import User


    class UserAccount(User):
        def __init__(self, username: str, email: str):
            super().__init__(username)
            self.email = email



.. code-block:: python
    :caption: auth.py

    from .auth_user import UserAccount

    [...]

    async def get_user(self, username: str) -> User
        userdata = await self._get_user(username)
        return UserAccount(
            userdata['username'],
            userdata['email']
        )


.. code-block:: python
    :caption: info.py

    from dazzler.components import core
    from dazzler.system import Page, BindingContext

    page = Page(
        __name__,
        core.Container([
            core.Html('h2', 'User info'),
            core.Container(identity='user-info', class_name='column')
        ]),
        require_login=True
    )


    @page.bind('class_name@user-info')
    async def on_load(ctx: BindingContext):
        await ctx.set_aspect(
            'user-info',
            children=[
                core.Container(f'Username: {ctx.user.username}'),
                core.Container(f'Email: {ctx.user.email}'),
            ]
        )

.. _Scrypt: https://docs.python.org/3/library/hashlib.html#hashlib.scrypt
.. _Salt: https://en.wikipedia.org/wiki/Salt_(cryptography)
