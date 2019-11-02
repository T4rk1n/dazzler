# pylint: disable=redefined-outer-name
import asyncio
import os

import pytest


def write_file(filename, content):
    with open(filename, 'w') as file:
        file.write(content)


@pytest.fixture(scope='module')
def reload_app(browser):
    from tests.hot_reload.hot_reload_app import app

    app.started = False

    async def _start():
        if not app.started:
            start_event = asyncio.Event()

            await app.main(
                blocking=False,
                debug=False,
                reload=True,
                start_event=start_event
            )
            await start_event.wait()
            app.started = True
        await browser.get('http://localhost:8150/')

    yield _start

    task = app.loop.create_task(app.stop())
    app.loop.run_until_complete(task)


@pytest.fixture
def reloader(reload_app):

    namespace = {
        'finisher': None
    }

    async def _start(finisher=None):
        await reload_app()
        namespace['finisher'] = finisher

    yield _start

    if namespace['finisher']:
        loop = asyncio.get_event_loop()
        # pylint: disable=not-callable
        task = loop.create_task(namespace['finisher']())
        loop.run_until_complete(task)


@pytest.mark.async_test
async def test_reload_python(reloader, browser):
    filename = 'tests/hot_reload/hot_reload_page.py'
    with open(filename, 'r') as f:
        initial = f.read()

    async def finisher():
        await browser.executor.execute(write_file, filename, initial)

    await reloader(finisher)
    await browser.wait_for_text_to_equal('#content', 'Initial')

    await browser.executor.execute(
        write_file, filename, initial.replace('Initial', 'Changed')
    )
    await browser.wait_for_text_to_equal(
        '.dazzler-renderer', 'Reloading...', timeout=20
    )
    await browser.wait_for_text_to_equal(
        '#content', 'Changed', timeout=20
    )


@pytest.mark.async_test
async def test_reload_requirement_existing(reloader, browser):

    filename = 'tests/hot_reload/requirements/initial.css'

    with open(filename, 'r') as f:
        initial = f.read()

    async def finisher():
        await browser.executor.execute(write_file, filename, initial)

    await reloader(finisher)

    await browser.executor.execute(
        write_file, filename, initial.replace(
            'rgba(255, 0, 0, 1)', 'rgba(0, 0, 255, 1)'
        )
    )
    await browser.wait_for_style_to_equal(
        '#content', 'background-color', 'rgba(0, 0, 255, 1)'
    )


@pytest.mark.async_test
async def test_reload_requirement_new(reloader, browser):

    filename = 'tests/hot_reload/requirements/new.css'

    async def finisher():
        if os.path.exists(filename):
            os.remove(filename)

    await reloader(finisher)

    await asyncio.sleep(1)
    await browser.executor.execute(
        write_file,
        filename,
        '.dazzler-core-container { padding: 10px }'
    )

    await browser.wait_for_style_to_equal(
        '#content', 'padding', '10px'
    )
