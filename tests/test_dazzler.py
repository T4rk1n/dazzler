"""
Main integrations test
"""
import pytest


@pytest.mark.async_test
async def test_click_output(browser):
    from tests.apps.click_output import app
    await app.main(blocking=False)

    await browser.get('http://localhost:8150/')

    clicker = await browser.wait_for_element_by_id('clicker')

    for i in range(1, 25):
        await app.executor.execute(clicker.click)

        await browser.wait_for_text_to_equal('#output', f'Clicked {i}')
        await browser.wait_for_style_to_equal(
            '#output', 'background-color',
            'rgba(255, 0, 0, 1)' if i % 2 == 1 else 'rgba(0, 0, 255, 1)'
        )

    await app.stop()


@pytest.mark.async_test
async def test_multi_page(browser):
    from tests.apps.multi_page import app

    await app.main(blocking=False)

    for num in ('one', 'two', 'three', 'four'):
        await browser.get(f'http://localhost:8150/{num}')
        await browser.wait_for_text_to_equal('#content', f'Page {num}')

    await app.stop()


@pytest.mark.async_test
async def test_binding_return_component(browser):
    from tests.apps.binding_return_component import app

    await app.main(blocking=False)

    await browser.get('http://localhost:8150/')

    clicker = await browser.wait_for_element_by_id('clicker')

    clicker.click()
    await browser.wait_for_text_to_equal('#from-binding', 'from binding')

    await app.stop()


@pytest.mark.async_test
async def test_layout_as_function(browser):
    from tests.apps.layout_as_function import app

    await app.main(blocking=False)

    await browser.get('http://localhost:8150')
    await browser.wait_for_text_to_equal('#layout', 'Layout as function')

    await app.stop()
