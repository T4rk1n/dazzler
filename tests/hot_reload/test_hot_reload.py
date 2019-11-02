import asyncio
import os

import pytest


def write_file(filename, content):
    with open(filename, 'w') as file:
        file.write(content)


@pytest.mark.async_test
async def test_reload_python(start_visit, browser):
    # This test a hard hot reload, reloading the page without refreshing.
    from tests.hot_reload import hot_reload_app

    start_event = asyncio.Event()

    await start_visit(hot_reload_app.app, reload=True, start_event=start_event)

    await browser.wait_for_text_to_equal('#content', 'Initial')

    filename = 'tests/hot_reload/hot_reload_page.py'
    with open(filename, 'r') as f:
        initial = f.read()

    try:
        await browser.executor.execute(
            write_file, filename, initial.replace('Initial', 'Changed')
        )
        await browser.wait_for_text_to_equal(
            '.dazzler-renderer', 'Reloading...', timeout=20
        )
        await browser.wait_for_text_to_equal(
            '#content', 'Changed', timeout=20
        )
    finally:
        await browser.executor.execute(write_file, filename, initial)


@pytest.mark.async_test
async def test_reload_requirement_existing(start_visit, browser):
    from tests.hot_reload import hot_reload_app

    start_event = asyncio.Event()

    await start_visit(hot_reload_app.app, reload=True, start_event=start_event)

    filename = 'tests/hot_reload/requirements/initial.css'

    with open(filename, 'r') as f:
        initial = f.read()

    try:
        await browser.executor.execute(
            write_file, filename, initial.replace('rgba(255, 0, 0, 1)', 'rgba(0, 0, 255, 1)')
        )
        await browser.wait_for_style_to_equal(
            '#content', 'background-color', 'rgba(0, 0, 255, 1)'
        )
    finally:
        await browser.executor.execute(write_file, filename, initial)


@pytest.mark.async_test
async def test_reload_requirement_new(start_visit, browser):
    from tests.hot_reload import hot_reload_app

    start_event = asyncio.Event()

    await start_visit(hot_reload_app.app, reload=True, start_event=start_event)

    filename = 'tests/hot_reload/requirements/new.css'

    try:
        await asyncio.sleep(1)
        await browser.executor.execute(
            write_file,
            filename,
            '.dazzler-core-container { padding: 10px }'
        )

        await browser.wait_for_style_to_equal(
            '#content', 'padding', '10px'
        )
    finally:
        if os.path.exists(filename):
            os.remove(filename)
