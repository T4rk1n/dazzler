import pytest


@pytest.mark.async_test
async def test_html_components(browser, start_page):
    from tests.components.pages.html2 import page

    await start_page(page)

    await browser.click('#clicker')
    await browser.wait_for_text_to_equal(
        '#clicker-output',
        '1'
    )

    await browser.wait_for_text_to_equal(
        'main section:first-child > h3',
        'Inputs'
    )
    await browser.click('#focus-select')
    await browser.wait_for_text_to_equal(
        '#focus-output',
        'Focused: true'
    )
