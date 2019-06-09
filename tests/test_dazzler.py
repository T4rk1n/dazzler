"""
Main integrations test
"""
import pytest


@pytest.mark.async_test
async def test_click_output(browser):
    from tests.apps.click_output import app
    await app.main(blocking=False)

    await browser.get('http://localhost:5417/')

    clicker = await browser.wait_for_element_by_id('clicker')

    for i in range(1, 25):
        await app.executor.execute(clicker.click)

        await browser.wait_for_text_to_equal('#output', f'Clicked {i}')

    await app.stop()


@pytest.mark.async_test
async def test_multi_page(browser):
    from tests.apps.multi_page import app

    await app.main(blocking=False)

    for num in ('one', 'two', 'three', 'four'):
        await browser.get(f'http://localhost:5417/{num}')
        await browser.wait_for_text_to_equal('#content', f'Page {num}')

    await app.stop()


@pytest.mark.async_test
async def test_binding_return_component(browser):
    from tests.apps.binding_return_component import app

    await app.main(blocking=False)

    await browser.get('http://localhost:5417/')

    clicker = await browser.wait_for_element_by_id('clicker')

    clicker.click()
    await browser.wait_for_text_to_equal('#from-binding', 'from binding')
