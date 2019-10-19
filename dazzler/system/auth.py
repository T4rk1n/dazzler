import asyncio
import functools
from typing import Optional, Callable, Awaitable
from urllib.parse import quote
from aiohttp import web

from dazzler.system import UNDEFINED
from ._middleware import Middleware
from ._page import Page


def _default_page(default_redirect):
    from dazzler.components import core, auth

    async def layout(request: web.Request):
        next_url = request.query.get('next_url') or default_redirect
        error = request.query.get('err')

        footer = core.Container(
            'Invalid credentials',
            style={'color': 'red', 'padding': '0.5rem'},
            identity='login-error'
        ) if error else UNDEFINED

        return core.Container([
            auth.Login(
                '/auth/login',
                method='post',
                identity='login-form',
                next_url=next_url,
                bordered=True,
                header=core.Html('h2', 'Please sign in'),
                footer=footer,
                style={
                    'padding': '2rem',
                }
            ),
        ], style={
            'display': 'flex',
            'justifyContent': 'center',
            'alignItems': 'center',
            'width': '100%',
            'marginTop': '4rem'
        })

    page = Page(__name__, layout, packages=['dazzler_core', 'dazzler_auth'])

    return page


class User:
    """
    Base user of the dazzler auth system.
    """
    username: str

    def __init__(self, username: str):
        self.username = username


class AuthBackend:
    """
    Handle the request part of authentication protocols.
    """

    async def is_authenticated(self, request: web.Request) -> bool:
        """
        If the request is authenticated.

        :param request: The request to verify if authentication credentials
            are provided.
        :return: Whether the user is authenticated.
        """
        raise NotImplementedError

    async def login(
            self, user: User, request: web.Request, response: web.Response
    ):
        """
        Do what it takes to store the login info after being successfully
        authenticated by the authenticator.

        :param user: The authenticated user
        :param request: Incoming request.
        :param response: A redirect response if needed to set cookies.
        :return:
        """
        raise NotImplementedError

    async def logout(
            self, user: User, request: web.Request, response: web.Response
    ):
        """
        Delete what makes this user authenticated in the system.

        :param user: User to logout.
        :param request: Incoming request.
        :param response: A redirect response if need to clear cookies.
        :return:
        """
        raise NotImplementedError

    async def get_username(self, request: web.Request) -> str:
        """
        Get the username from the request.

        :param request: Incoming request.
        :return: Retrieved username.
        """
        raise NotImplementedError


class AuthSessionBackend(AuthBackend):
    async def is_authenticated(self, request: web.Request) -> bool:
        username = await request['session'].get('username')
        return username is not UNDEFINED

    async def login(
            self, user: User,
            request: web.Request,
            response: web.Response
    ):
        session = request['session']
        await session.set('username', user.username)

    async def logout(self, user, request, response):
        session = request['session']
        await session.delete('username')

    async def get_username(self, request: web.Request) -> str:
        return await request['session'].get('username')


class Authenticator:
    """
    Base authenticator, a subclass of this must be presented to
    DazzlerAuth init in order to provide authentication for an app.
    """

    async def authenticate(self, username: str, password: str) \
            -> Optional[User]:
        """
        For login purpose.

        :param username:
        :param password:
        :return:
        """
        raise NotImplementedError

    async def get_user(self, username: str) -> User:
        """
        Retrieve a user by it's username.

        :param username:
        :return:
        """
        raise NotImplementedError


class AuthMiddleware(Middleware):
    """
    Add the user if authenticated to the request object.
    """

    def __init__(self, app, auth):
        self.app = app
        self.auth = auth

    async def __call__(
            self, request: web.Request
    ) -> Optional[Callable[[web.Response], Awaitable]]:
        if await self.auth.backend.is_authenticated(request):
            request['user'] = await self.auth.authenticator.get_user(
                (await self.auth.backend.get_username(request))
            )
        return None


class DazzlerAuth:
    """
    Handle the logic for page authentication.

    Requires an authenticator to provide

    Default to session backend, make sure a session middleware is present.
    """

    def __init__(
            self, app,
            authenticator: Authenticator,
            backend: AuthBackend = None,
            login_page: Page = None,
            default_redirect: str = None,
    ):
        """
        :param app:
        :type app: dazzler.Dazzler
        :param backend:
        """
        self.app = app
        self.backend = backend or AuthSessionBackend()
        self.authenticator = authenticator
        self.app.middlewares.append(AuthMiddleware(app, self))
        self.login_page = login_page or _default_page(default_redirect)
        app.server.route_page = self.require_page_login(app.server.route_page)
        app.server.route_page_json = self.require_page_login(
            app.server.route_page_json, redirect=False,
        )
        app.server.route_update = self.require_page_login(
            app.server.route_update, redirect=False,
        )

        self.login_page.route('/login', method='post')(self.login)
        self.login_page.route('/logout', method='post')(self.logout)
        app.add_page(self.login_page)

    async def login(self, request: web.Request):
        data = await request.post()
        next_url = data.get('next_url')
        username = data.get('username')
        password = data.get('password')
        response = web.HTTPSeeOther(location=next_url)
        user = await self.authenticator.authenticate(username, password)
        if user:
            await self.backend.login(user, request, response)
            raise response

        # Cheap throttling on failures.
        await asyncio.sleep(0.25)
        login_url = request.app.router[self.login_page.name].url_for()
        if self.login_page:
            raise web.HTTPFound(
                location=f'{login_url}?next_url={quote(next_url)}&err=1'
            )
        raise web.HTTPUnauthorized()

    async def logout(self, request: web.Request):
        data = await request.post()

        next_url = data.get('next_url')
        response = web.HTTPSeeOther(location=next_url)
        user = await self.authenticator.get_user(
            (await self.backend.get_username(request))
        )
        await self.backend.logout(user, request, response)
        raise response

    def require_page_login(self, func, redirect=True):

        @functools.wraps(func)
        async def auth_page_wrapper(request: web.Request, page: Page):
            if page.require_login:
                if not await self.backend.is_authenticated(request):
                    if self.login_page and redirect:
                        url = str(
                            request.app.router[self.login_page.name].url_for()
                        )
                        next_url = str(request.url)

                        raise web.HTTPFound(
                            location=f'{url}?next_url={quote(next_url)}'
                        )
                    raise web.HTTPUnauthorized()
            return await func(request, page)

        return auth_page_wrapper
