.. _session:

Session
=======

The session system is a key/value system associated with each client connected.
Accessible in bindings context with the ``session`` attribute.

.. attention::
    The session system is activated by default!

Configure
---------

Enable/disable the session system:

.. code-block:: toml

    [session]
    enable = true

Set the cookie name to put the session id:

.. code-block:: toml

    [session]
    cookie_name = 'session'

Duration options:

.. code-block:: toml

    [session]
    # Maximum duration of a session in seconds. (Default=30 days)
    duration = 2592000

    # Refresh the session when accessed after this number of seconds.
    # (Default=7 days)
    refresh_after = 604800

Secure the cookie with:

.. code-block:: toml

    secret_key = 'something-randomly-long'

    [session]
    salt = 'generate-a-hash'

Backend
^^^^^^^

Choose a backend from:

:File:
    Default backend, associate a json file stored in app data to each
    user session. Not recommended for production environments.
:PostgreSQL:
    Recommended, store the data in the ``session`` table.
:Redis:
    Fast key value databases are perfect as session store.

Session Methods
---------------

Three operation can be done on key value pairs:

- :py:meth:`~.dazzler.system.session.Session.get`
- :py:meth:`~.dazzler.system.session.Session.set`
- :py:meth:`~.dazzler.system.session.Session.delete`

.. seealso::

    :py:class:`~.dazzler.system.session.Session`

Usage via binding
-----------------

A session object is available via the
:py:class:`~.dazzler.system.BindingContext``

.. code-block:: python

    @page.bind('clicks@btn')
    async def on_click(ctx: BindingContext):
        my_value = await ctx.session.get('my_value')


Usage via route
---------------

Also available via the request object for regular routes.

.. code-block:: python

    @page.route('/my-route')
    async def my_route(request):
        my_value = await request['session'].get('my_value')
