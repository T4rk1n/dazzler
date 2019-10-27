# pylint: disable=redefined-outer-name
import asyncio

import pytest

from dazzler import Dazzler
from dazzler.components import core
from dazzler.system import Page, Trigger, BindingContext
from dazzler.system.session import (
    SessionMiddleware, RedisSessionBackend, FileSessionBackEnd
)


@pytest.fixture
def session_app():
    app = Dazzler(__name__)
    app.config.session.duration = 3

    page = Page(
        __name__,
        core.Container([
            core.Container(identity='session-output', clicks=1)
        ]),
        url='/'
    )

    @page.bind(Trigger('session-output', 'clicks'))
    async def on_session(ctx: BindingContext):
        await ctx.set_aspect('session-output', children=ctx.session.session_id)

    app.add_page(page)

    return app


@pytest.mark.async_test
@pytest.mark.parametrize('backend', [
    FileSessionBackEnd,
    RedisSessionBackend
])
async def test_session(start_visit, browser, backend):
    app = Dazzler(__name__)
    app.config.session.enable = False
    app.middlewares.append(SessionMiddleware(app, backend=backend(app)))

    page = Page(
        __name__,
        url='/',
        layout=core.Container([
            core.Button('Click', identity='session-click'),
            core.Container(identity='session-output'),
            core.Button('Remove session', identity='remove-session'),
        ])
    )

    @page.bind(Trigger('session-click', 'clicks'))
    async def on_session(ctx: BindingContext):
        session = ctx.request['session']

        clicks = await session.get('clicks') or 0
        clicks += 1
        await session.set('clicks', clicks)

        await ctx.set_aspect('session-output', children=f'Clicked {clicks}')

    @page.bind(Trigger('remove-session', 'clicks'))
    async def on_remove(ctx: BindingContext):
        session = ctx.request['session']
        await session.delete('clicks')

    app.add_page(page)

    await start_visit(app)

    for i in range(1, 4):
        await browser.get('http://localhost:8150/')
        await browser.click('#session-click')
        await browser.wait_for_text_to_equal('#session-output', f'Clicked {i}')

    # Delete session item
    await browser.click('#remove-session')
    await browser.click('#session-click')
    await browser.wait_for_text_to_equal('#session-output', f'Clicked 1')


@pytest.mark.async_test
async def test_expired_session(start_visit, session_app, browser):
    await start_visit(session_app)
    await asyncio.sleep(0.5)

    first = (await browser.wait_for_element_by_id('session-output')).text

    await asyncio.sleep(4)
    await browser.get('http://localhost:8150/')
    await asyncio.sleep(0.5)

    second = (await browser.wait_for_element_by_id('session-output')).text

    assert first != second, 'Session should be changed after expiration'


@pytest.mark.async_test
async def test_refresh_session(start_visit, session_app, browser):
    session_app.config.session.refresh_after = 1
    await start_visit(session_app)
    await asyncio.sleep(1.1)

    first = (await browser.wait_for_element_by_id('session-output')).text

    await browser.get('http://localhost:8150/')
    await asyncio.sleep(2)
    await browser.get('http://localhost:8150/')

    second = (await browser.wait_for_element_by_id('session-output')).text
    assert first == second

    await asyncio.sleep(3)
    await browser.get('http://localhost:8150/')

    second = (await browser.wait_for_element_by_id('session-output')).text
    assert first != second
