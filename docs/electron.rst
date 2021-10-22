********
Electron
********

Create desktop applications with Dazzler and `Electron <https://www.electronjs.org/>`_.

.. tip::
    Quickstart with a Github template: https://github.com/T4rk1n/dazzler-electron-template

Requirements
============

- Install npm first: https://www.npmjs.com/
- Install electron dependencies: ``pip install dazzler[electron]``

For developing and running app locally, you will need to install electron
somewhere on your path: ``npm i -G electron``

Commands
========

- Run a local instance of your application: ``dazzler electron app.py``
- Package your application: ``dazzler electron-build app.py``
- Publish: ``dazzler electron-build app.py --publish``

Configuration
=============

Dazzler electron requires a config file to work properly.
Generate a new config with all the defaults: ``dazzler dump-configs dazzler.toml``.

To override the config file used by dazzler, you can provide the `-c` option
before the command (eg: ``dazzler -c production.toml electron-build app.py``).

The target application must call :py:meth:`~.dazzler.Dazzler.start` in the main
section.

.. code-block:: python

    from dazzler import Dazzler
    app = Dazzler(__name__)

    if __name__ == '__main__':
        app.start()

Page Windows
------------

To create a window, add a page to ``electron.windows`` with the page name.
If the application contains only one page, it will automatically create
a window for it.

.. code-block:: toml

    [electron]
    windows = ["main"]

A window will be created for each entry if a matching :py:class:`~.dazzler.system.Page`
is found.

Window settings
^^^^^^^^^^^^^^^

To set window attributes like width and height, add settings to the page with
the :py:class:`~.dazzler.system.Page` parameter ``electron_window``.

.. code-block:: python

    from dazzler.system import Page

    page = Page(
        __name__,
        'component',
        electron_window={'width': 1048, 'height': 768}
    )

.. seealso::
    - :py:class:`~.dazzler.electron.ElectronWindowSettings`
    - Electron BrowserWindow reference: https://www.electronjs.org/docs/latest/api/browser-window

Default size
++++++++++++

Defaults size for all windows can be set with configs:

.. code-block:: toml

    [electron.window_size]
    width = 800
    height = 600
    fullscreen = false

Window state at runtime
++++++++++++++++++++++++++++

Use :py:class:`~.dazzler.electron.components.WindowState` to read and control
the window state after the application has started.

.. code-block:: python

    from dazzler.system import Page
    from dazzler.components.core import Text, Container
    from dazzler.components.electron import WindowState

    page = Page(
        'dazzler_electron',
        Container([
            WindowState(identity='window'),
            Box([Text('Width: '), Text(identity='width-output')])
        ])
    )

    page.tie('width@window', 'text@width-output')


Save window size
^^^^^^^^^^^^^^^^

Save the window size on quit and reload them when re-opening the application.

.. code-block:: toml

    [electron]
    save_window_size = true

Multiple instances
^^^^^^^^^^^^^^^^^^

To allow multiple instances of the application, set the ``port_range`` config to
true to have a new port assigned for each new instances.

.. code-block:: toml

    port = 62895
    port_range = true

Loading window
--------------

The ``[electron.loading_window]`` config section is used to create a loading
window on startup if the server instance has to load data and takes longer
to start.

The window look can be customized in with either a custom html file or adding a
header/footer.

.. code-block:: toml

    [electron.loading_window]
    enabled = true
    html_file = "/path/to/html"
    header = "<div>Header</div>"
    footer = "<div>Footer</div>"

The options config is the window settings for the loading window, the
defaults values place a small window in the middle of the screen without
a frame.

**Slow to load on windows**

The packaged executable is slow to load the initial window on Windows
due to Windows Defender. You need to sign your application to load instantly,
the loading window is also affected by that.

Packaging
---------

Packaging the application needs a few config to be setup, ``[electron.metadata]``
section should be filled up, the ``app_name`` needs to set for the name
of the executable.

The default target is ``dir`` which output the executable in a directory. The
default output directory is ``electron`` and can be changed with the command
parameter ``-o``. Inside that folder will be generated
the package.json and node_modules installed for the build, the target files
can be found in the dist folder and the electron executable is located in
``dist/{platform}-unpacked`` directory with the given ``app_name``.

Publish
^^^^^^^

Publish the application using the parameter ``--publish`` for the
``electron-build`` command. ``electron.publish.provider`` must set in the
configs with the related options.

Evaluating if the application is packaged
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Use :py:func:`~.dazzler.electron.is_compiled` to determine if the application
is running when compiled.

.. code-block:: python

    from dazzler import Dazzler
    from dazzler.electron import is_compiled

    app = Dazzler(__name__)
    ...
    if __name__ == '__main__':
        if is_compiled():
            app.start('')
        else:
            app.start('--reload')

Limitations
===========

- No support for ``pages_directory`` config option.
- Auth system should be disabled.
- Session system should be disabled.

Development tips
================

- Do not include secrets inside the app, the binary can easily be decompiled.
- If there's an error in the startup, electron will still be alive and after a
  while will consume lots of memory/cpu resources. Kill the processes
  manually via command line or task manager on windows.

If porting an existing web app:

- Do not connect directly to databases, create external services api and
  fetch from them.
- If loading lot of data on startup, think of putting that inside a binding
  instead so the startup is faster.

.. seealso::
    - :doc:`../examples/electron_app` example.
