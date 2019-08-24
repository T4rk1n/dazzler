import asyncio

import pytest


@pytest.mark.async_test
async def test_markdown_render(start_page, browser):
    from tests.components.pages.markdown import page

    await start_page(page)

    await asyncio.sleep(1)

    # Just test that two elements render since this is a wrapper
    # it should be tested by it's lib.
    await browser.wait_for_text_to_equal('#markdown h1', 'Foo')
    await browser.wait_for_text_to_equal('#markdown h2', 'Bar')
