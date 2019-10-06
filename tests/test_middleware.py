from typing import Optional, Callable, Awaitable

import pytest
from aiohttp import web

from dazzler import Dazzler
from dazzler.system import Page, Middleware, Trigger, BindingContext
from dazzler.components import core


class DummyMiddleware(Middleware):
    async def __call__(
            self, request: web.Request
    ) -> Optional[Callable[[web.Response], Awaitable]]:
        request['dummy'] = 'dummy'

        async def set_dummy(response: web.Response):
            response.set_cookie('dummy', 'dummy-cookie')

        return set_dummy


async def layout(request: web.Request):
    return core.Container([
        core.Container(
            request.get('dummy', 'foobar'),
            identity='request-output'
        ),
        core.Container(identity='cookie-output'),
        core.Button('Set from cookie', identity='cookie-setter')
    ])


@pytest.mark.async_test
async def test_middleware(start_visit, browser):
    page = Page(__name__, layout=layout, url='/')

    @page.bind(Trigger('cookie-setter', 'clicks'))
    async def on_cookie(ctx: BindingContext):
        cookie = ctx.request.cookies.get('dummy')
        await ctx.set_aspect('cookie-output', children=cookie)

    app = Dazzler(__name__)
    app.middlewares.append(DummyMiddleware())
    app.add_page(page)

    await start_visit(app)

    await browser.wait_for_text_to_equal('#request-output', 'dummy')
    await browser.click('#cookie-setter')
    await browser.wait_for_text_to_equal('#cookie-output', 'dummy-cookie')
