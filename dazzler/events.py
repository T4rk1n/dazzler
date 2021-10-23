"""
Event names to subscribe.

.. code-block:: python

    from dazzler import Dazzler
    from dazzler.events DAZZLER_SETUP

    app = Dazzler(__name__)

    async def setup(_):
        pass

    app.events.subscribe(DAZZLER_SETUP, setup)

"""
DAZZLER_START = 'dazzler_start'
DAZZLER_SETUP = 'dazzler_setup'
DAZZLER_STOP = 'dazzler_stop'
