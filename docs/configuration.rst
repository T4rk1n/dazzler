Configuration
=============

Dazzler makes extensive use of a config system accessible thru the application
``config`` property. The values of the config can set by,
in order of priority:

- Code
- CLI Argument
- Environment variable
- Config file

File
----

Generate an empty configuration file at the root of the project:

``$ dazzler dump-configs dazzler.toml``

Default config
--------------

.. literalinclude:: ./dazzler.toml
    :caption: dazzler.toml
    :name: default-config

.. seealso::
    Config system provided by `Precept`_

.. _Precept: https://github.com/T4rk1n/precept
