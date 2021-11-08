.. _middlewares:

Middlewares
===========

Dazzler middleware acts on all dazzler pages and routes. They are used to
modify the aiohttp requests context.

Postgres
--------

:py:class:`dazzler.contrib.postgresql.PostgresMiddleware`

Insert aiopg pool in the request context.

Install
^^^^^^^

``pip install dazzler[postgresql]``

Configure
^^^^^^^^^

Set the connection details with configuration or with environ ``POSTGRES_DSN``:

.. code-block:: toml

    [postgres]
    dsn = 'host=localhost port=5432 dbname=dbname user=user password=pw'

Options to change the keys used for the request and application:

..  code-block:: toml

    [postgres.middleware]
    # Default values
    request_key = 'postgres'
    app_key = 'postgres'

.. note::
    A PostgresMiddleware is automatically added to the application if using
    the session or authentication system with PostgreSQL.

.. seealso::
    :py:class:`dazzler.contrib.postgresql.PostgresConfig`

Usage
^^^^^

Use in context:

.. code-block:: python

    @page.bind('value@input')
    async def on_input(ctx: BindingContext):
        pool = ctx.request['postgres']

        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute('...')

.. seealso::
    aiopg documentation: https://aiopg.readthedocs.io/

Redis
-----

:py:class:`dazzler.contrib.redis.Redis`

Insert aioredis pool in the request context.

Install
^^^^^^^

``pip install dazzler[redis]``

Configure
^^^^^^^^^
Set ``REDIS_URL`` environ variable to change the url used.

.. note::
    Automatically added when the session backend is set to ``Redis``

    .. code-block:: toml

        [session]
        backend = 'Redis'

Usage
^^^^^
Use in context:

.. code-block:: python

    @page.bind('value@input')
    async def on_value(ctx: BindingContext):
        redis = ctx.request['redis']

Session
-------

:py:class:`dazzler.system.session.SessionMiddleware`

Insert a :py:class:`~.dazzler.system.session.Session` instance into the
request context. Automatically scoped to the current visitor.

Configure
^^^^^^^^^

Set the backend to use from the following options:
``File``, ``Redis``, ``PostgreSQL``.

.. code-block::

    [session]
    backend = 'File'

Usage
^^^^^

Use with the context, directly available:

.. code-block:: python

    @page.bind('value@input')
    async def on_input(ctx: BindingContext):
        session_value = await ctx.session.get('key')

.. seealso::
    :ref:`Session system documentation <session>`

Auth
----

:py:class:`dazzler.system.auth.AuthMiddleware`

Adds the current user to the request.

.. note::
    Automatically added when using the authentication system.

.. seealso::
    :ref:`Authentication system documentation <authentication>`

Custom
------

Create custom middlewares by implementing :py:class:`dazzler.system.Middleware`
