from typing import Optional

import pytest

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


def get_app():
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


@pytest.mark.async_test
async def test_login_logout(browser):
    app = get_app()

    await app.main(blocking=False, debug=True)

    await browser.get('http://localhost:8150/safe')

    login_username = await browser.wait_for_element_by_css_selector(
        '#login-form .login-username'
    )
    login_username.send_keys('AgentSmith')
    login_password = await browser.wait_for_element_by_css_selector(
        '#login-form .login-password'
    )
    login_password.send_keys('SuperSecret1')
    await browser.click('#login-form .login-button')

    # Every request should have a user if authenticated.
    await browser.wait_for_text_to_equal('#username-output', 'AgentSmith')

    await browser.click('#logout .logout-button')
    await browser.wait_for_text_to_equal(
        '#login-form .login-header', 'Please sign in'
    )

    await app.stop()

