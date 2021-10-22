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

Session
=======

The session system is activated by default with a default backend using json
files stored locally on the server. It is a key/value system associated
with each client connected.

Another backend option is `Redis`, you need to install the dependency with:

.. code-block:: sh

    pip install dazzler[redis]

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
