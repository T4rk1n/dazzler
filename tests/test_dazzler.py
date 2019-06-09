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

    driver = AsyncDriver(webdriver.Chrome(), app.loop)

    await driver.get('http://localhost:5417/')

    clicker = await driver.wait_for_element_by_id('clicker')

    for i in range(1, 25):
        await app.executor.execute(clicker.click)

        await driver.wait_for_text_to_equal('#output', f'Clicked {i}')

    app.stop()
    driver.driver.stop_client()
