from enum import auto
from typing import Callable, Awaitable, Union

from aiohttp import web
from precept import AutoNameEnum


class RouteMethod(AutoNameEnum):
    GET = auto()
    POST = auto()
    PUT = auto()
    PATCH = auto()
    DELETE = auto()
    CONNECT = auto()
    OPTIONS = auto()
    HEAD = auto()

    def get_method(self):
        return getattr(web, self.value)


class Route:
    def __init__(
            self,
            path: str,
            handler: Callable[[web.Request], Awaitable[web.Response]],
            method: Union[str, RouteMethod] = RouteMethod.GET,
            name: str = None
    ):
        self.path = path
        self.handler = handler
        if isinstance(method, str):
            self.method = getattr(RouteMethod, method.upper())
        else:
            self.method = method
        self.name = name
