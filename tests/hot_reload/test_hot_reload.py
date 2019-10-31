import asyncio

import pytest


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

    def open_write(content):
        with open(filename, 'w') as file:
            file.write(content)

    try:
        await browser.executor.execute(
            open_write, initial.replace('Initial', 'Changed')
        )
        await browser.wait_for_text_to_equal(
            '.dazzler-renderer', 'Reloading...', timeout=20
        )
        await browser.wait_for_text_to_equal(
            '#content', 'Changed', timeout=20
        )
    finally:
        await browser.executor.execute(open_write, initial)
