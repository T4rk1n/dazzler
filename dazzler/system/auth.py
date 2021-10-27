import asyncio
import functools
from typing import Optional, Callable, Awaitable, List
from urllib.parse import quote
from aiohttp import web

from ._undefined import UNDEFINED
from ._middleware import Middleware
from ._page import Page
from ..events import DAZZLER_SETUP


def _default_page(
    default_redirect,
    page_title='Login',
    form_header='Sign In',
    page_url='/auth',
) -> Page:
    from dazzler.components import core, auth

    async def layout(request: web.Request):
        next_url = request.query.get('next_url') or default_redirect
        error = request.query.get('err')

        if request.get('user'):
            return core.Text('Already signed on!')

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
                header=core.Html('h2', form_header),
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

    page = Page(
        __name__, layout,
        packages=['dazzler_core', 'dazzler_auth'],
        title=page_title,
        url=page_url,
    )

    return page


def build_register_page(
    register_handler,
    title='New User',
    include_email=False,
    page_name='register',
    page_url='/auth/register',
    custom_fields=None,
    submit_label='Register',
    username_pattern=r'[\w\d\-_]+'
) -> Page:
    from dazzler.components import core, html
    from dazzler.presets import PresetColor

    fields = [
        {
            'name': 'username',
            'label': 'Username',
            'input_props': {
                'required': True,
                'minLength': 2,
                'maxLength': 100,
                'pattern': username_pattern,
            }
        },
        {
            'name': 'password',
            'label': 'Password',
            'type': 'password',
            'input_props': {
                'required': True,
                'minLength': 8,
                'maxLength': 256
            }
        }
    ]
    if include_email:
        fields.append({
            'name': 'email',
            'label': 'Email',
            'type': 'email',
            'input_props': {
                'required': True,
            }
        })
    fields = fields + (custom_fields or [])

    submit_url = f'{page_url}/submit'

    async def layout(request: web.Request):
        error = request.query.get('error')
        if request.get('user'):
            return core.Text(
                'Already registered!', font_weight='bold'
            )

        if error:
            footer = core.Panel(
                content=core.Text(
                    error,
                    style={'color': 'red', 'padding': '0.5rem'}
                ),
                title_background=PresetColor.DANGER_DARK,
                title_color='neutral',
                title='Error',
                preset_background='neutral-light'
            )
        else:
            footer = UNDEFINED

        return core.Box(core.Container(
            [
                core.Form(
                    fields=fields,
                    header=html.H2(title),
                    submit_label=submit_label,
                    footer=footer,
                    action=submit_url,
                    method='post',
                    preset_background=PresetColor.NEUTRAL,
                    bordered=True,
                    rounded=True,
                    stacked=True,
                ),
            ],
            width='80%',
            padding_top='4rem'
        ),
            justify='center',
            # preset_background=PresetColor.NEUTRAL_DARK,
            min_height='100vh',
            height='100%'
        )

    page = Page(
        page_name,
        layout,
        packages=['dazzler_core', 'dazzler_html'],
        url=page_url,
        title=title,
    )

    page.route('/submit', method='post')(register_handler)

    return page


class User:
    """
    Base user of the dazzler auth system.
    """
    username: str
    roles: Optional[List[str]]
    email: Optional[str]
    metadata: Optional[dict]

    def __init__(
        self,
        username: str,
        roles: List[str] = None,
        email: str = None,
        metadata: dict = None,
    ):
        self.username = username
        self.roles = roles or []
        self.email = email
        self.metadata = metadata


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
    """Auth Backend integrated with the session system."""

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

    :type app: dazzler.Dazzler
    """
    app = None

    def __init__(self, app):
        self.app = app

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

    async def authorize(self, user: User, page: Page) -> bool:
        """
        Implement to authorize on a page basis.

        :param user:
        :param page:
        """
        return len(set(user.roles).intersection(page.authorizations)) > 0

    async def register_user(
        self,
        username: str,
        password: str,
        email: str = None,
        fields: dict = None,
    ) -> Optional[str]:
        """
        Register an user on form submit.

        Return a string as an error, otherwise the operation is successful.
        """


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

    Requires an authenticator to provide the end user authentication method.

    Default to session backend, make sure a session middleware is present.

    Activates in the configs with:

        [authentication]
        enable = True
        authenticator = "module.submodule:AuthenticatorClass"
    """

    def __init__(
            self, app,
            authenticator: Authenticator,
            backend: AuthBackend = None,
            login_page: Page = None,
            default_redirect: str = None,
            register_page: Page = None
    ):
        """
        :param app:
        :type app: dazzler.Dazzler
        :param backend:
        """
        self.app = app
        self.backend = backend or AuthSessionBackend()
        self.authenticator = authenticator
        self.authenticator.app = app
        self.app.middlewares.append(AuthMiddleware(app, self))
        self.login_page = login_page or _default_page(
            default_redirect,
            page_title=app.config.authentication.login.page_title,
            page_url=app.config.authentication.login.page_url,
            form_header=app.config.authentication.login.form_header,
        )
        app.server.route_page = self.require_page_login(app.server.route_page)
        app.server.route_page_json = self.require_page_login(
            app.server.route_page_json, redirect=False,
        )
        app.server.route_update = self.require_page_login(
            app.server.route_update, redirect=False,
        )
        app.server.route_call = self.require_page_login(
            app.server.route_call, redirect=False,
        )

        self.login_page.route('/login', method='post')(self.login)
        self.login_page.route('/logout', method='post')(self.logout)
        self.logout_url = f'{self.login_page.url}/logout'
        app.add_page(self.login_page)

        if app.config.authentication.register.enable:
            register = app.config.authentication.register
            self.register_page = register_page or build_register_page(
                self.register,
                page_name=register.page_name,
                page_url=register.page_url,
                custom_fields=self._get_custom_fields(),
                include_email=register.require_email,
            )
            app.add_page(self.register_page)

        app.events.subscribe(DAZZLER_SETUP, self._setup)

    async def login(self, request: web.Request):
        data = await request.post()
        next_url = data.get('next_url')
        username = data.get('username')
        password = data.get('password')
        login_url = request.app.router[self.login_page.name].url_for()

        if not next_url:
            next_url = self.app.config.authentication.login.default_redirect
        response = web.HTTPSeeOther(location=next_url)

        if not username or not password:
            raise web.HTTPFound(
                location=f'{login_url}?next_url={quote(next_url)}&err=1'
            )

        user = await self.authenticator.authenticate(username, password)
        if user:
            await self.backend.login(user, request, response)
            raise response

        # Cheap throttling on failures.
        await asyncio.sleep(0.25)

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

    async def register(self, request: web.Request):
        data = await request.post()
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            raise web.HTTPSeeOther(
                location=f'{self.register_page.url}?'
                         f'error={quote("Please fill username and password")}',
            )

        email = data.get('email')

        fields = {
            field['name']: data.get(field['name'])
            for field in self._get_custom_fields()
        }
        if username.lower() in \
                self.app.config.authentication.register.reserved_usernames:
            raise web.HTTPSeeOther(
                location=f'{self.register_page.url}'
                         f'?error={quote("Invalid username")}',
            )
        self.app.logger.debug(f'Register user: {username}')
        error = await self.authenticator.register_user(
            username, password, email, fields
        )
        if not error:
            response = web.HTTPSeeOther(
                location=self.app.config.authentication.register.next_url
            )
            # login on the backend after registering.
            await self.backend.login(User(username), request, response)
            raise response

        error_message = 'Invalid user information'
        if self.app.config.debug:
            # Only show error info if not in production.
            error_message = error

        raise web.HTTPSeeOther(
            location=f'{self.register_page.url}?error={quote(error_message)}',
        )

    def require_page_login(self, func, redirect=True, handle_page=True):

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
                if page.authorizations:
                    authorized = False
                    user = request.get('user')
                    if user:
                        authorized = await self.authenticator.authorize(
                            user,
                            page
                        )
                    if not authorized:
                        raise web.HTTPForbidden
            if handle_page:
                return await func(request, page)
            return await func(request)

        return auth_page_wrapper

    def _get_custom_fields(self):
        return [
            {'name': name, 'label': label, 'type': field_type}
            for name, label, field_type
            in self.app.config.authentication.register.custom_fields
        ]

    async def _setup(self, _):
        # Wrap all pages routes with a login required.
        for page in self.app.pages.values():
            if not page.require_login:
                continue
            for route in page.routes:
                route.handler = functools.partial(
                    self.require_page_login(route.handler, handle_page=False),
                    page=page,
                )
