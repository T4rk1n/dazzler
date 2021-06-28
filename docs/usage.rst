*****
Usage
*****

.. contents::

Install
=======

Install with pip:

``pip install dazzler``

Getting started
===============

Start by creating the directory structure of the project, usually the main
application file will be on the root project and the code/pages will be
in a package.

**Example project structure:**

- ``application.py``
- ``/my_package``
    - ``__init__.py``
    - ``/pages``
        - ``__init__.py``
        - ``/requirements``
            - ``styles.css``
        - ``my_page.py``


.. code-block:: python
    :caption: application.py

    from dazzler import Dazzler

    app = Dazzler(__name__)

    # Main app code, add pages, setup configs, etc.
    ...

    if __name__ == '__main__':
        # Start the development server.
        app.start()

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

.. code-block:: python3
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

To update components after the initial layout, you can use page bindings. The
:py:class:`~.dazzler.system.BindingContext` argument can be used to ``set`` and
``get`` other component aspects from the backend and holds the trigger/states
value. It can also be used to access the ``WebStorage`` of the browser.

:Examples:

Update a container on click of a button.

.. code-block:: python3
    :caption: my_package.pages.bound_page.py

    from dazzler.system import Page, Trigger
    from dazzler.components import core

    layout = core.Container([
        core.Input(placeholder='Enter name', identity='input'),
        core.Button('Click me', identity='btn'),
        core.Container(identity='output'),
    ])

    page = Page(__name__, layout)

    @page.bind(Trigger('btn', 'clicks'))
    async def on_click(ctx):
        name = await ctx.get_aspect('input', 'value')
        await ctx.set_aspect('output', children=f'Hello {name}')


Regex bindings can be used as trigger/states for identity and aspect.

.. literalinclude:: ../tests/apps/pages/regex_bindings.py
    :lines: 5-42

Configuration File
==================

Generate an empty configuration file at the root of the project:

``$ dazzler dump-configs dazzler.toml``

.. literalinclude:: ./dazzler.toml
    :caption: dazzler.toml
    :name: default-config
