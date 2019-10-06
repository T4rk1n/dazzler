from typing import Optional, Callable, Awaitable

from aiohttp import web


class Middleware:
    """
    Middleware functions are called before every routes registered by dazzler.

    Add callback by returning a function taking the response as argument.

    .. code-block:: python3

        from dazzler.system import Middleware

        class MyMiddleware(Middleware):
            async def __call__(self, request):

                async def set_cookie(response):
                    response.set_cookie('cookie', 'value')

                return set_cookie
    """
    async def __call__(
            self,
            request: web.Request,
    ) -> Optional[Callable[[web.Response], Awaitable]]:
        raise NotImplementedError
