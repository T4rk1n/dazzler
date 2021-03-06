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
    app.finishers = []

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
        return app

    yield _start

    task = app.loop.create_task(app.stop())
    app.loop.run_until_complete(task)
    for finisher in app.finishers:
        app.loop.run_until_complete(app.loop.create_task(finisher()))


@pytest.fixture
def reloader(reload_app):

    async def _start(finisher=None):
        app = await reload_app()
        if finisher:
            app.finishers.append(finisher)

    yield _start


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


@pytest.mark.async_test
async def test_reload_requirement_css_deleted(reloader, browser):

    filename = 'tests/hot_reload/requirements/delete_me.css'
    with open(filename) as f:
        initial = f.read()

    async def finisher():
        await browser.executor.execute(write_file, filename, initial)

    await reloader(finisher)

    os.remove(filename)

    await browser.wait_for_style_to_equal(
        '#content', 'margin', '0px'
    )


@pytest.mark.async_test
async def test_reload_requirement_js_deleted(reloader, browser):
    filename = 'tests/hot_reload/requirements/injector.js'

    with open(filename) as f:
        initial = f.read()

    async def finisher():
        await browser.executor.execute(write_file, filename, initial)

    await reloader(finisher)

    await browser.wait_for_text_to_equal('#injected', 'Injected')

    os.remove(filename)

    await browser.wait_for_text_to_equal('#injected', 'Static')
