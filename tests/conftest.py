import asyncio
import os

import pytest


# noinspection PyProtectedMember
# pylint: disable=inconsistent-return-statements
from selenium import webdriver

from dazzler import Dazzler
from tests.tools import AsyncDriver, kill_processes


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
    driver_name = os.getenv('SELENIUM_BROWSER', 'Chrome')
    driver = AsyncDriver(getattr(webdriver, driver_name)())
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
            pages_directory='null',
            **kwargs
    ):
        namespace['app'] = app
        app.config.pages_directory = pages_directory
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
    app.config.pages_directory = 'none'

    async def _start_page(page, debug=False):
        page.url = '/'
        app.add_page(page)
        await start_visit(app, debug=debug)

    return _start_page


@pytest.fixture()
def run_background_cmd():
    namespace = {'processes': [], 'tasks': []}

    def _runner(cmd):
        async def runner():
            namespace['proceses'].append(
                await asyncio.create_subprocess_shell(cmd))

        namespace['tasks'].append(
            asyncio.get_event_loop().create_task(runner()))

    yield _runner

    async def killer():
        for proc in namespace['processes']:
            await kill_processes(proc.pid)
            await proc.wait()

        for task in namespace['tasks']:
            task.cancel()

    asyncio.get_event_loop().run_until_complete(killer())


@pytest.fixture()
def electron_driver():
    namespace = {}

    def initialize(binary_location):
        options = webdriver.ChromeOptions()
        options.binary_location = binary_location
        driver = namespace['driver'] = webdriver.Chrome(
            executable_path=os.getenv('ELECTRON_DRIVER', 'chromedriver'),
            chrome_options=options
        )
        return AsyncDriver(driver)

    yield initialize

    if 'driver' in namespace:
        # Need close not quit to cleanup the processes in electron.
        namespace['driver'].close()
