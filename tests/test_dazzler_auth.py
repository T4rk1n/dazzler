from typing import Optional

import pytest

from aiohttp import client

from dazzler import Dazzler
from dazzler.components import core, auth as _auth
from dazzler.system import Page, Trigger
from dazzler.system.auth import DazzlerAuth, Authenticator, User
from dazzler.system.session import SessionMiddleware, RedisSessionBackend


class DummyAuthenticator(Authenticator):
    async def authenticate(self, username: str, password: str)\
            -> Optional[User]:
        if username == 'AgentSmith' and password == 'SuperSecret1':
            return User(username,)

    async def get_user(self, username: str) -> User:
        return User(username)


@pytest.fixture
def auth_app():
    app = Dazzler(__name__)
    page = Page(__name__, core.Container([
        core.Html('h2', 'logged-in', identity='header'),
        core.Container(identity='username-output'),
        _auth.Logout('/auth/logout', identity='logout')
    ]), url='/safe', require_login=True)

    @page.bind(Trigger('header', 'children'))
    async def on_username(ctx):
        user = ctx.request['user']
        await ctx.set_aspect('username-output', children=user.username)

    app.add_page(page)
    app.config.security.secret_key = 'SecretKey'
    app.middlewares.append(
        SessionMiddleware(app, backend=RedisSessionBackend(app))
    )

    DazzlerAuth(app, DummyAuthenticator())

    return app


async def proceed_login(browser, username, password):
    login_username = await browser.wait_for_element_by_css_selector(
        '#login-form .login-username'
    )
    login_username.send_keys(username)
    login_password = await browser.wait_for_element_by_css_selector(
        '#login-form .login-password'
    )
    login_password.send_keys(password)
    await browser.click('#login-form .login-button')


@pytest.mark.async_test
async def test_login_logout(auth_app, browser):
    await auth_app.main(blocking=False, debug=True)
    await browser.get('http://localhost:8150/safe')

    await proceed_login(browser, 'AgentSmith', 'SuperSecret1')

    # Every request should have a user if authenticated.
    await browser.wait_for_text_to_equal('#username-output', 'AgentSmith')

    await browser.click('#logout .logout-button')
    await browser.wait_for_text_to_equal(
        '#login-form .login-header', 'Please sign in'
    )

    await auth_app.stop()


@pytest.mark.async_test
async def test_invalid_login(auth_app, browser):
    await auth_app.main(blocking=False, debug=True)
    await browser.get('http://localhost:8150/safe')

    await proceed_login(browser, 'NotGood', 'NoGood')

    await browser.wait_for_text_to_equal('#login-error', 'Invalid credentials')
    await auth_app.stop()


@pytest.mark.async_test
async def test_unauthenticated_data(auth_app):
    await auth_app.main(blocking=False)
    async with client.ClientSession() as session:
        rep = await session.request('post', 'http://localhost:8150/safe')
        assert rep.status == 401

    await auth_app.stop()
