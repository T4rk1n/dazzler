.. chatroom:

Chatroom Example
----------------

Using dazzler session system and redis, create a pubsub based chatroom.

Setup
=====

Install supported ``aioredis`` client with ``pip install dazzler[redis]``.

Set the ``REDIS_URL`` environ variable if necessary.
(Default: ``redis://localhost:6379``)

Code
====

.. literalinclude:: ../../tests/apps/samples/chatroom.py

Some styles to go along:

.. literalinclude:: ../../tests/apps/samples/requirements/chatroom.css
