"""Package system related tests"""
import pytest
from aiohttp import web

from dazzler.components import core
from dazzler.system import Page, Route


@pytest.mark.async_test
async def test_package_route(start_page, browser):
    async def package_route(_):
        return web.Response(
            body='<html><head></head><body>'
                 '<div id="content">Package route</div>'
                 '</body></html>',
            content_type='text/html'
        )

    await start_page(
        Page('package', core.Container(), routes=[
            Route('/package-route', package_route)
        ])
    )

    await browser.get('http://localhost:8150/package-route')
    await browser.wait_for_text_to_equal('#content', 'Package route')
