import asyncio
import json
import os
import time
import weakref
import uuid
import enum

from typing import Any, Optional

import appdirs
from itsdangerous import Signer, BadSignature
from aiohttp import web

from ..errors import SessionError
from ._middleware import Middleware
from ._undefined import UNDEFINED


class SessionAction(enum.Enum):
    GET = 1
    SET = 2
    DELETE = 3


class Session:
    """
    Session object available in requests by the middleware

    Access with ``request['session']``. Or from binding: ``context.session``
    """

    def __init__(
            self,
            session_id: str,
            query_queue: asyncio.Queue,
    ):
        """
        :param session_id: The session id to perform operations.
        :param query_queue: To send commands up.
        """
        self._session_id = session_id
        self._query_queue = query_queue

    async def get(self, key: str) -> Any:
        """
        Get an item from the session.

        :param key: The item to fetch.
        :return: The value of the key for the session.
        """
        queue = asyncio.Queue()
        await self._query_queue.put(
            (SessionAction.GET, self._session_id, key, queue)
        )
        return await queue.get()

    async def set(self, key: str, value: Any):
        """
        Associate a value with a key for the session.

        :param key: Key to set for the session
        :param value: The value to set.
        :return:
        """
        await self._query_queue.put(
            (SessionAction.SET, self._session_id, key, value)
        )

    async def delete(self, key):
        """
        Delete the value at key.

        :param key: Key to delete.
        :return:
        """
        await self._query_queue.put(
            (SessionAction.DELETE, self._session_id, key, 0)
        )

    async def pop(self, key):
        """
        Retrieve and delete the key.

        :param key:
        :return:
        """
        data = await self.get(key)
        await self.delete(key)
        return data


class SessionBackEnd:
    """
    Base class to save & load sessions.
    """
    def __init__(self, app):
        """
        :param app: Running dazzler app.
        :type app: dazzler.Dazzler
        """
        self.app = app

    async def set(self, session_id: str, key: str, value: Any):
        """
        Set a key for the session id.

        :param session_id: Session to set data with a key.
        :param key: Key to set
        :param value: Value to keep.
        :return:
        """
        raise NotImplementedError

    async def get(self, session_id: str, key: str):
        """
        Get a key for the session id.

        :param session_id: Session to fetch the data for.
        :param key: Key to get.
        :return:
        """
        raise NotImplementedError

    async def delete(self, session_id: str, key: str):
        """
        Delete a session key value.

        :param session_id: Session to delete the key for.
        :param key: The key to delete.
        :return:
        """
        raise NotImplementedError


class FileSessionBackEnd(SessionBackEnd):
    """
    Session backed by the file system.

    Should only be used for development purpose where redis or another
    solution is not available.
    """
    def __init__(self, app):
        super().__init__(app)
        self.save_directory = os.path.join(
            appdirs.user_data_dir('dazzler-data'),
            app.app_name,
        )
        if not os.path.exists(self.save_directory):
            os.makedirs(self.save_directory)
        app.events.subscribe('dazzler_setup', self.cleanup)
        app.events.subscribe('dazzler_start', self.cleanup)
        app.events.subscribe('dazzler_stop', self.cleanup)

    async def save(self, session_id: str, data: dict):
        await self.acquire(session_id)

        with open(self._session_path(session_id), 'w') as f:
            json.dump(data, f)

        self.release(session_id)

    async def load(self, session_id: str) -> Optional[dict]:
        path = self._session_path(session_id)
        if not os.path.exists(path):
            return UNDEFINED

        await self.acquire(session_id)

        with open(self._session_path(session_id)) as f:
            data = json.load(f)

        self.release(session_id)
        return data

    async def acquire(self, session_id: str):
        while self._locked(session_id):
            await asyncio.sleep(0.005)

        self._lock(session_id)

    async def set(self, session_id: str, key: str, value: Any):
        data = await self.load(session_id)

        if data is UNDEFINED:
            data = {}

        data[key] = value
        await self.save(session_id, data)

    async def get(self, session_id: str, key: str) -> Any:
        data = await self.load(session_id)
        if data is not UNDEFINED:
            return data.get(key, UNDEFINED)
        return UNDEFINED

    async def delete(self, session_id: str, key: str):
        data = await self.load(session_id)
        if data is UNDEFINED or key not in data:
            return
        data.pop(key)
        await self.save(session_id, data)

    def release(self, session_id: str):
        os.remove(self._session_path(session_id, lock=True))

    def _locked(self, session_id: str) -> bool:
        return os.path.exists(self._session_path(session_id, lock=True))

    def _session_path(self, session_id: str, lock=False) -> str:
        path = os.path.join(self.save_directory, f'{session_id}.json')
        if lock:
            path += '.lock'
        return path

    def _lock(self, session_id: str):
        with open(self._session_path(session_id, lock=True), 'w') as f:
            f.write('locked')

    async def cleanup(self, _):
        now = time.time()
        for file in os.listdir(self.save_directory):
            if not file.endswith('json'):
                return
            path = os.path.join(self.save_directory, file)
            modified = os.path.getmtime(path)
            if now - modified > self.app.config.session.duration:
                os.remove(path)


class RedisSessionBackend(SessionBackEnd):
    """
    Backed by aioredis.

    Values are serialized to json first to keep the types.

    Install with ``pip install dazzler[redis]``

    :seealso: https://aioredis.readthedocs.io/
    """

    def __init__(self, app):
        super().__init__(app)
        asyncio.get_event_loop().create_task(self._setup())

    async def _setup(self):
        import aioredis
        self.redis = await aioredis.create_redis_pool(
            os.getenv('REDIS_URL', 'redis://localhost:6379')
        )

    async def set(self, session_id: str, key: str, value: Any):
        transaction = self.redis.multi_exec()
        # Serialize to keep the type.
        transaction.hset(session_id, key, json.dumps({'v': value}))
        transaction.expire(
            session_id, self.app.config.session.duration
        )
        await transaction.execute()

    async def get(self, session_id: str, key: str):
        if not await self.redis.hexists(session_id, key):
            return UNDEFINED
        data = await self.redis.hget(session_id, key)
        await self.redis.expire(
            session_id, self.app.config.session.duration
        )
        data = json.loads(data)
        return data['v']

    async def delete(self, session_id: str, key: str):
        await self.redis.hdel(session_id, key)


class SessionMiddleware(Middleware):
    """
    Insert session objects into requests.
    """
    _backend: SessionBackEnd

    def __init__(self, app, backend=None):
        """
        :param app: Dazzler application.
        :type app: dazzler.Dazzler
        :param backend:
        :type backend: SessionBackEnd
        """
        if not app.config.secret_key:
            raise SessionError('Missing app secret key!')
        if app.config.secret_key == 'Please change me':
            app.logger.warning(
                'Please change the app secret key in the configs.'
            )
        self.app = app
        self.signer = Signer(
            app.config.secret_key,
            salt=app.config.session.salt
        )
        self._backend = backend or FileSessionBackEnd(app)
        self._sessions_queues = weakref.WeakValueDictionary()
        self._query_queue = asyncio.Queue()
        loop = asyncio.get_event_loop()
        self._handlers = [
            loop.create_task(self._handle_queries()),
        ]
        self.app.events.subscribe('dazzler_stop', self._on_stop)

    def generate_session_id(self):
        return self.signer.sign(uuid.uuid4().hex).decode()

    def verify_session_id(self, session_id):
        return self.signer.unsign(session_id).decode()

    async def _handle_queries(self):
        while not self.app.stop_event.is_set():
            action, session_id, key, arg = await self._query_queue.get()
            if action == SessionAction.GET:
                data = await self._backend.get(session_id, key)
                await arg.put(data)
            elif action == SessionAction.SET:
                await self._backend.set(session_id, key, arg)
            elif action == SessionAction.DELETE:
                await self._backend.delete(session_id, key)

    async def __call__(self, request: web.Request):
        session_id = request.cookies.get(
            self.app.config.session.cookie_name
        )
        callback = None

        if not session_id:
            session_id = self.generate_session_id()

            async def set_cookie(response):
                response.set_cookie(
                    self.app.config.session.cookie_name,
                    session_id,
                    httponly=True,
                    max_age=self.app.config.session.duration,
                )

            callback = set_cookie
        try:
            # TODO improve by regenerating a good key instead.
            self.verify_session_id(session_id)
        except BadSignature:
            error = web.HTTPUnauthorized()
            error.del_cookie(self.app.config.session.cookie_name)
            raise error

        request['session'] = Session(
            session_id,
            self._query_queue,
        )

        return callback

    async def _on_stop(self, _):
        for handler in self._handlers:
            handler.cancel()
