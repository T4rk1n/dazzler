*****
Usage
*****

Install
=======

Install with pip:

``pip install dazzler``

Getting started
===============

Create the directory structure of the project, usually the main
application file will be on the root project and the code/pages will be
in a package.

Pages inside the  to the config ``page_directory``

**Example project structure:**

.. code-block:: text

    app.py
    dazzler.toml
    /pages
        __init__.py
        /requirements
            styles.css
        my_page.py


.. code-block:: python
    :caption: app.py

    from dazzler import Dazzler

    app = Dazzler(__name__)

    # Main app code, add pages, setup configs, etc.
    ...

    if __name__ == '__main__':
        # Start the development server.
        app.start()

.. tip::
    Quickstart with a github template
    https://github.com/T4rk1n/dazzler-app-template

Pages
-----

Dazzler apps are divided in pages, each pages have it's own layout and bindings.

The first argument of the page is the name of the file (``__name__``), it is
used to determine the location of the page requirements folder. By default, a
directory named ``requirements`` will be looked for and it's contents are served
by the page.

The name will also be used for the url and title, so make your filename is
adequate or override them in the page constructor.

.. code-block:: python
    :caption: my_package.pages.my_page.py

    from dazzler.system import Page

    page = Page(
        __name__,
        layout=core.Container('My page'),
        url='/my-page',
        title='My Page'
    )

Then you can add the page to the dazzler application with:

.. code-block:: python
    :caption: application.py

    ...
    from my_package.pages import my_page
    ...
    app.add_page(my_page.page)

You can now start the application (``$ python application.py``) and
navigate to ``http://localhost:8150/my-page``

.. seealso:: :py:class:`~.dazzler.system.Page`

Requirements
^^^^^^^^^^^^

Every CSS/JS files contained in a directory named ``requirements`` at the same
level of the page file will be included on the page. Styles are loaded
after components styles to ensure priority of user CSS.

.. note::
    The directory can be changed via page parameter ``requirements_dir``.
    The path is relative to the page file.

Components
----------

Many components are available to build beautiful interactive pages. They are
composed of aspects which are properties shared between the backend and the
frontend.

Every component has an identity which allows to add a trigger when a component
aspect is updated by the browser to perform actions and update other aspects
by the server.

Components are divided in packages which holds all their requirements and
metadata.

.. code-block:: python
    :caption: my_package.pages.page_two.py

    from dazzler.system import Page
    from dazzler.components import core

    # Container is the main components to holds other data, it is a div with
    # some aspects to style it.
    layout = core.Container([
        # A viewport can be used to create a tabbed layout.
        core.ViewPort([
            {
                'Home': core.Container([
                    core.Html('h2', 'Homepage'),
                    core.Container('Welcome to my page.'),
                ]),
                'About': core.Container([
                    core.Html('h2', 'About'),
                    core.Container('lorem ipsum')
                ])
            },
            tabbed=True,
        ])
    ])

    page = Page(__name__, layout)

.. seealso::

    - :py:class:`~.dazzler.system.Component`
    - :py:class:`~.dazzler.system.Package`
    - :py:mod:`~.dazzler.components` packages


Bindings
--------

To update components after the initial layout, you can use page bindings.
Bound functions takes a context argument that is used to ``set`` aspects
and access to the session and user systems.

- :py:meth:`~.dazzler.system.Page.bind` executes updates via websockets, it
  allows for two-ways communication and long running functions.
  The :py:class:`~.dazzler.system.BindingContext` is used to ``get`` other
  component aspects in real time from the frontend.
  It can also be used to access the ``WebStorage`` of the browser.
- :py:meth:`~.dazzler.system.Page.call` is a regular request update.
  :py:class:`~.dazzler.system.CallContext` can only ``set`` aspects, states can
  be used if other aspects are required.

Short Identifier
^^^^^^^^^^^^^^^^

Components properties can be specified as a simple string to use as trigger or
state for
:py:meth:`~.dazzler.system.Page.bind`,
:py:meth:`~.dazzler.system.Page.call` or
:py:meth:`~.dazzler.system.Page.tie`.

Syntax: ``<aspect>@<identity>`` -> ``clicks@btn``

Examples
^^^^^^^^

Binding
"""""""

Update a container on click of a button.

.. code-block:: python
    :caption: pages/bound_page.py

    from dazzler.system import Page, Trigger
    from dazzler.components import core

    layout = core.Container([
        core.Input(placeholder='Enter name', identity='input'),
        core.Button('Click me', identity='btn'),
        core.Container(identity='output'),
    ])

    page = Page(__name__, layout)

    @page.bind('clicks@btn')
    async def on_click(ctx):
        name = await ctx.get_aspect('input', 'value')
        await ctx.set_aspect('output', children=f'Hello {name}')

Call
""""

Calls can only ``set`` aspects synchronously once the bound function
has finished.

.. code-block:: python
    :caption: pages/calls.py

    from dazzler.system import Page, CallContext
    from dazzler.components.core import Box, Button, Form, Text, Input

    page = Page(
        __name__,
        Box([
            Form(
                fields=[
                    {
                        'label': 'First Name',
                        'name': 'first-name',
                        'component': Input(identity='firstname')
                    },
                    {
                        'label': 'Last Name',
                        'name': 'last_name',
                        'component': Input(identity='lastname')
                    }
                ],
                include_submit=False,
                identity='form',
            ),
            Button('Submit', identity='submit'),
            Box(identity='output')
        ], column=True)
    )


    @page.call('clicks@submit', 'value@firstname', 'value@lastname')
    async def on_submit_call(ctx: CallContext):
        ctx.set_aspect(
            'output',
            children=Text(
                f'Hello {ctx.states["firstname"]["value"]}'
                f' {ctx.states["lastname"]["value"]}',
                color='green'
            )
        )

Regex Identifier
""""""""""""""""

Regex bindings can be used as trigger/states for identity and aspect. Any
trigger matching will be executed.

.. literalinclude:: ../tests/apps/pages/regex_bindings.py
    :lines: 5-42

Ties & Transforms
-----------------

You can use :py:meth:`~.dazzler.system.Page.tie` method of
:py:class:`~.dazzler.system.Page` to link aspects together without
the need to define a binding for UI updates.
This update operates entirely on the frontend.

:py:class:`~.dazzler.system.transforms.Transform`'s are operations of a tie to
apply on the trigger value before updating the target aspect.
They can be chained to provide interactions with components aspects
on the frontend.
:py:class:`~.dazzler.system.transforms.AspectValue` starts a chain with the
aspect value resolved. For value transforms,
a :py:class:`~.dazzler.system.Target` can be used instead of a raw value
to get that aspect value.

Examples
^^^^^^^^

1 to 1 tie
""""""""""

Update a :py:class:`~.dazzler.components.core.ViewPort` active view
from a :py:class:`~.dazzler.components.core.Dropdown` value.

.. code-block:: python

    from dazzler.system import Page
    from dazzler.components import core

    page = Page(
        __name__,
        core.Container([
            core.Dropdown(
                options=['one', 'two', 'three'],
                value='one',
                identity='dropdown'
            ),
            core.ViewPort(
                active='one',
                views={
                    'one': core.Container('one'),
                    'two': core.Container('two'),
                    'three': core.Container('three')
                },
                identity='viewport'
            )
        ])
    )

    page.tie('value@dropdown', 'active@viewport')


Transform tied values
"""""""""""""""""""""

Use :py:class:`~.dazzler.system.transforms.Transform`'s to change the tied
trigger value.

Switch between a light and dark theme:

.. literalinclude:: ../tests/apps/pages/theme_transform.py

.. seealso::
    - :py:mod:`dazzler.system.transforms` - API reference.
    - :ref:`transforms_example` - Example of most transforms usage.


Header & Footer
===============

A header or footer can be added to all the pages of the application.

.. code-block::python

    from dazzler import Dazzler
    from dazzler.system import BindingContext,
    from dazzler.components import core, icons, html

    app = Dazzler(__name__)

    async def header_layout(request):
        # Page is added automatically to layout request.
        page = request['page']

        return core.Container([
            # Add those icons packs globally
            icons.IconLoader(),
            icons.FoundIconPack(),
            html.H1(page.title),
            core.Button('fi-thumbnails', identity='menu-btn'),
            core.Container([
                core.Link(page_name='one'),
                core.Link(page_name='two'),
                core.Text(identity='menu-username')
            ], hidden=True, identity='header-menu')
        ])

    app.header.layout = layout

    # toggle the menu with a tie
    app.header.tie('clicks@btn', 'hidden@header-menu').transform(
        t.Modulus(2).t(t.Equals(0))
    )

    # Or update via binding/calls
    @app.header.bind(
        Trigger(
            aspect='hidden',
            identity='header-menu',
            once=True,
        )
    )
    async def on_click_menu(ctx: BindingContext):
        if ctx.user:
            await ctx.set_aspect(
                'menu-username',
                text=ctx.user.username
            )


Integrated systems
==================

Authentication and session systems are available to use with databases.

Backends
--------

:PostgreSQL:

    PostgreSQL is available for both session and authentication.

    :Install:
        ``pip install dazzler[postgresql]``
    :Configure:
        .. code-block:: toml

            [postgres]
            # Also set by environ: POSTGRES_DSN
            dsn = 'host=localhost port=5432 dbname=dbname user=user password=pw'

            [session]
            backend = 'PostgreSQL'

            [authentication]
            authenticator = 'dazzler.contrib.postgresql:PostgresAuthenticator'

:Redis:

    Redis can be used as a Session backend.

    :Install:
        ``pip install dazzler[redis]``
    :Configure:
        Set the ``REDIS_URL`` environ variable,
        default: ``redis://localhost:6379``.

        .. code-block:: toml

            [session]
            backend = 'Redis'

Session
-------

The session system is used to associate data to users of the application
when using bindings. It is enabled by default and interacted with the
:py:class:`~.dazzler.system.BindingContext`` ``session`` attribute,
automatically scoped to the current user.

**Basic usage:**

.. code-block:: python

    @page.bind('clicks@btn')
    async def on_click(ctx: BindingContext):
        my_value = await ctx.session.get('my_value')

.. seealso::
    :ref:`Session documentation <session>`

.. warning::
    The session system should not be used with Electron applications.

    Disable the session system:

    .. code-block:: toml

        [session]
        enable = false

Authentication
--------------

This system provide pages and routes for authentication like login, logout,
register and a user administration page. Pages can ``require_login`` before the user
can access it and additional authorizations can be necessary with the
``authorizations`` keyword of the :py:class:`~.dazzler.system.Page`.

Enable with configuration:

.. code-block:: toml

    [authentication]
    enable = true

.. seealso::
    :ref:`Session documentation <session>`

.. warning::
    The authentication system is currently not suited for use with
    Electron applications.
