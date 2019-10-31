import asyncio
import pytest


# noinspection PyProtectedMember
# pylint: disable=inconsistent-return-statements
from selenium import webdriver

from dazzler import Dazzler
from tests.tools import AsyncDriver


@pytest.mark.tryfirst
def pytest_pyfunc_call(pyfuncitem):
    """Run tests marked as async in the loop."""
    for marker in pyfuncitem.own_markers:
        if marker.name == 'async_test':
            loop = asyncio.get_event_loop()
            task = loop.create_task(pyfuncitem.obj(**{
                k: pyfuncitem.funcargs[k]
                for k in pyfuncitem._fixtureinfo.argnames
            }))
            loop.run_until_complete(task)
            return True


@pytest.fixture(scope='session')
def browser():
    driver = AsyncDriver(webdriver.Chrome())
    yield driver
    driver.driver.quit()


@pytest.fixture()
def start_visit(browser):  # pylint: disable=redefined-outer-name
    namespace = {
        'app': None
    }

    async def _start_app(
            app,
            url='http://localhost:8150/',
            debug=False,
            start_event=None,
            **kwargs
    ):
        namespace['app'] = app
        await app.main(
            blocking=False,
            debug=debug,
            start_event=start_event,
            **kwargs
        )
        if start_event:
            await start_event.wait()
        await browser.get(url)

    yield _start_app

    loop = asyncio.get_event_loop()
    task = loop.create_task(
        namespace['app'].stop()
    )
    loop.run_until_complete(task)


@pytest.fixture()
def start_page(start_visit):  # pylint: disable=redefined-outer-name
    app = Dazzler(__name__)

    async def _start_page(page, debug=False):
        page.url = '/'
        app.add_page(page)
        await start_visit(app, debug=debug)

    return _start_page
