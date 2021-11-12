import json
import os
from typing import Any

from aiohttp import web

from dazzler.events import DAZZLER_SETUP, DAZZLER_STOP
from dazzler.system import Middleware, UNDEFINED
from dazzler.system.session import SessionBackEnd


async def get_redis_pool():
    import aioredis
    return await aioredis.create_redis_pool(
        os.getenv('REDIS_URL', 'redis://localhost:6379')
    )


class RedisMiddleware(Middleware):
    """
    Insert the aioredis pool instance into the aiohttp app and requests.

    :type redis: aioredis.Redis
    :type app: dazzler.Dazzler
    """
    def __init__(self, app, redis=None):
        self.app = app
        self.redis = redis
        app.events.subscribe('dazzler_setup', self._setup)

    async def _setup(self, _):
        if not self.redis:
            self.redis = await get_redis_pool()
        self.app.server.app['redis'] = self.redis

    async def __call__(self, request: web.Request):
        request['redis'] = self.redis


class RedisSessionBackend(SessionBackEnd):
    """
    Backed by aioredis.

    Values are serialized to json first to keep the types.

    Install with ``pip install dazzler[redis]``

    :seealso: https://aioredis.readthedocs.io/

    :type redis: aioredis.Redis
    """
    def __init__(self, app, redis=None):
        super().__init__(app)
        self.redis = redis
        app.events.subscribe(DAZZLER_SETUP, self._setup)
        app.events.subscribe(DAZZLER_STOP, self._cleanup)

    async def _cleanup(self, _):
        self.redis.close()
        await self.redis.wait_closed()

    async def _setup(self, _):
        if not self.redis and 'redis' in self.app.server.app:
            self.redis = self.app.server.app['redis']
        else:
            self.redis = await get_redis_pool()

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
