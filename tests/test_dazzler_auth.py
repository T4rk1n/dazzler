# pylint: disable=redefined-outer-name
import sys
from typing import Optional

import secrets
import pytest

import aiohttp
from aiohttp import client, web

from dazzler import Dazzler
from dazzler.components import core, auth as _auth
from dazzler.system import Page, Trigger
from dazzler.system.auth import DazzlerAuth, Authenticator, User


class DummyAuthenticator(Authenticator):
    async def authenticate(self, username: str, password: str)\
            -> Optional[User]:
        if username == 'AgentSmith' and password == 'SuperSecret1':
            return User(username,)

    async def get_user(self, username: str) -> User:
        return User(username, roles=['user', 'mod'])


@pytest.fixture
def auth_app():
    app = Dazzler(__name__)
    page = Page('test-auth', core.Container([
        core.Html('h2', 'logged-in', identity='header'),
        core.Container(identity='username-output'),
        _auth.Logout('/auth/logout', identity='logout')
    ]), url='/', require_login=True)

    @page.bind(Trigger('header', 'children'))
    async def on_username(ctx):
        user = ctx.request['user']
        await ctx.set_aspect('username-output', children=user.username)

    @page.route('/page-route')
    async def page_route(_):
        return web.Response(
            body='<html><head></head><body>'
                 '<div id="content">auth page route</div>'
                 '</body></html>',
            content_type='text/html'
        )

    admin_page = Page(
        'admin', core.Box('admin', identity='content'),
        url='/admin', authorizations=['admin'],
        require_login=True,
    )
    mod_page = Page(
        'mod', core.Box('mod', identity='content'),
        url='/mod', authorizations=['mod'],
        require_login=True,
    )

    app.add_page(page, admin_page, mod_page)
    app.config.session.backend = 'Redis'
    app.config.authentication.register.require_email = False
    app.config.secret_key = str(
        secrets.randbits(128).to_bytes(16, sys.byteorder)
    )

    DazzlerAuth(app, DummyAuthenticator(app))

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
async def test_login_logout(auth_app, start_visit, browser):
    await start_visit(auth_app)

    await proceed_login(browser, 'AgentSmith', 'SuperSecret1')

    # Every request should have a user if authenticated.
    await browser.wait_for_text_to_equal('#username-output', 'AgentSmith')

    await browser.click('#logout .logout-button')
    await browser.wait_for_text_to_equal(
        '#login-form .login-header', 'Sign In'
    )


@pytest.mark.async_test
async def test_invalid_login(auth_app, start_visit, browser):
    await start_visit(auth_app)
    await proceed_login(browser, 'NotGood', 'NoGood')
    await browser.wait_for_text_to_equal('#login-error', 'Invalid credentials')


@pytest.mark.async_test
async def test_unauthenticated_data(auth_app):
    await auth_app.main(blocking=False)
    try:
        async with client.ClientSession() as session:
            rep = await session.request('post', 'http://localhost:8150/')
            assert rep.status == 401
    finally:
        await auth_app.stop()


@pytest.mark.async_test
async def test_unauthenticated_ws(auth_app):
    await auth_app.main(blocking=False)
    try:

        async with client.ClientSession() as session:
            with pytest.raises(aiohttp.WSServerHandshakeError) as context:
                async with session.ws_connect(
                        'ws://localhost:8150/test-auth/ws') as ws:
                    await ws.close()

            assert context.value.status == 401
    finally:
        await auth_app.stop()


@pytest.mark.async_test
async def test_auth_from_configs(start_visit, browser):
    app = Dazzler(__name__)
    app.config.authentication.enable = True
    app.config.session.backend = 'Redis'
    app.config.authentication.authenticator = \
        'tests.test_dazzler_auth:DummyAuthenticator'

    page = Page(
        __name__,
        core.Container('my-page', identity='content'),
        require_login=True,
        url='/'
    )
    app.add_page(page)

    await start_visit(app)
    await browser.get('http://localhost:8150/')

    await proceed_login(browser, 'AgentSmith', 'SuperSecret1')
    await browser.wait_for_text_to_equal('#content', 'my-page')


@pytest.mark.async_test
async def test_page_route_require_login(auth_app, start_visit, browser):
    await start_visit(auth_app)
    await browser.get('http://localhost:8150/page-route')
    await proceed_login(browser, 'AgentSmith', 'SuperSecret1')
    await browser.wait_for_text_to_equal('#content', 'auth page route')


@pytest.mark.async_test
async def test_page_authorizations(auth_app, start_visit, browser):
    await start_visit(auth_app)
    await browser.get('http://localhost:8150/mod')
    await proceed_login(browser, 'AgentSmith', 'SuperSecret1')
    await browser.wait_for_text_to_equal('#content', 'mod')

    await browser.get('http://localhost:8150/admin')
    await browser.wait_for_text_to_equal('body', '403: Forbidden')


@pytest.mark.async_test
async def test_register(auth_app, start_visit, browser):
    await start_visit(auth_app)
    await browser.get('http://localhost:8150/auth/register')

    username_input = await browser.wait_for_element_by_css_selector(
        'div.form-field:nth-child(1) > input:nth-child(2)'
    )
    username_input.send_keys('Neo')
    password_input = await browser.wait_for_element_by_css_selector(
        'div.form-field:nth-child(2) > input:nth-child(2)'
    )
    password_input.send_keys('secure_enough')

    await browser.click('.form-submit')
    await browser.wait_for_text_to_equal('#username-output', 'Neo')
