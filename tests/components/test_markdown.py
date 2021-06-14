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
    await browser.wait_for_element_by_xpath(
        '//*[@id="markdown"]/p/a[contains(text(), "google")]'
    )
    # Test a prism code block was inserted.
    # FIXME Auto CodeBlock has changed in react-markdown
    #  from renderers->components.
    # await browser.wait_for_element_by_xpath(
    #     '//*[@id="markdown"]/div/pre[contains(@class, "language-jsx")]'
    # )
