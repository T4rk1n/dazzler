import pytest


@pytest.mark.async_test
async def test_page_parts(browser, start_visit):
    from tests.apps.page_parts.page_parts import app

    await start_visit(app, pages_directory='tests/apps/page_parts/pages')

    await browser.get('http://localhost:8150/first')
    await browser.wait_for_text_to_equal('#first', 'first')
    await browser.wait_for_text_to_equal('#header', ' Header')

    for selector in ('header', 'first', 'footer'):
        await browser.click(f'#bind-{selector}-clicker')
        await browser.wait_for_text_to_equal(f'#bind-{selector}-output', '1')

    await browser.get('http://localhost:8150/second')
    await browser.wait_for_text_to_equal('#second', 'second')
    await browser.wait_for_text_to_equal('#footer', 'Footer')

    await browser.get('http://localhost:8150/without')
    await browser.wait_for_text_to_equal('#without', 'Without')
    elem = browser.driver.find_elements_by_css_selector('#header')
    assert not elem
