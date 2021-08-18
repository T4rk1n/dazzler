import pytest


@pytest.mark.async_test
async def test_common_styles(browser, start_page):
    from tests.components.pages.common_styles import page

    await start_page(page)

    await browser.wait_for_style_to_equal(
        '#padded-margin', 'padding-bottom', '10px'
    )
    await browser.wait_for_style_to_equal(
        '#padded-margin', 'margin-bottom', '5px'
    )
    await browser.wait_for_style_to_equal(
        '#colored', 'color', 'rgba(255, 0, 0, 1)'
    )
    await browser.wait_for_style_to_equal(
        '#colored', 'background-color', 'rgba(0, 0, 255, 1)'
    )
    await browser.wait_for_style_to_equal(
        '#preset-container', 'overflow', 'auto'
    )
    await browser.wait_for_style_to_equal(
        '#preset-container', 'max-height', '200px'
    )

    await browser.wait_for_style_to_equal(
        '#preset-color', 'font-size', '24px'
    )
    await browser.wait_for_style_to_equal(
        '#preset-color', 'color', 'rgba(82, 148, 226, 1)'
    )
    await browser.wait_for_style_to_equal(
        '#preset-color', 'background-color', 'rgba(240, 173, 78, 1)'
    )
