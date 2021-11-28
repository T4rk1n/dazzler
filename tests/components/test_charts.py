import pytest


@pytest.mark.async_test
async def test_charts(start_page, browser):
    from tests.components.pages.graphs import page

    await start_page(page)

    await browser.click('#prepend-data')
    await browser.click('#append-data')
    await browser.click('#insert-data')
    await browser.click('#concat-data')
    circles = await browser.wait_for_elements_by_css_selector(
        '#line-chart circle'
    )

    assert len(circles) == 29
    await browser.click('#delete-data')
    circles = await browser.wait_for_elements_by_css_selector(
        '#line-chart circle'
    )
    assert len(circles) == 28

    # Make sure the unwrapped components can be updated.
    await browser.click('#change-scatter-fill')
    await browser.wait_for_element_by_xpath(
        '//*[name()="path"][@id="scatter-series"][@fill="#44bb33"]'
    )
