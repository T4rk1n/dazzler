"""
Main integrations test
"""
import pytest

from selenium import webdriver

from tests.tools import AsyncDriver


@pytest.mark.async_test
async def test_click_output():
    from tests.apps.click_output import app
    await app.main(blocking=False)

    driver = AsyncDriver(webdriver.Chrome())

    await driver.get('http://localhost:5417/')

    clicker = await driver.wait_for_element_by_id('clicker')

    for i in range(1, 25):
        await app.executor.execute(clicker.click)

        await driver.wait_for_text_to_equal('#output', f'Clicked {i}')

    await app.stop()
    driver.driver.close()


@pytest.mark.async_test
async def test_multi_page():
    from tests.apps.multi_page import app

    driver = AsyncDriver(webdriver.Chrome())

    await app.main(blocking=False)

    for num in ('one', 'two', 'three', 'four'):
        await driver.get(f'http://localhost:5417/{num}')
        await driver.wait_for_text_to_equal('#content', f'Page {num}')

    await app.stop()
    driver.driver.close()


@pytest.mark.async_test
async def test_binding_return_component():
    from tests.apps.binding_return_component import app

    driver = AsyncDriver(webdriver.Chrome())

    await app.main(blocking=False)

    await driver.get('http://localhost:5417/')

    clicker = await driver.wait_for_element_by_id('clicker')

    clicker.click()
    await driver.wait_for_text_to_equal('#from-binding', 'from binding')
