"""Extra components tests"""
import asyncio
import math

import pytest


@pytest.mark.async_test
async def test_pager(start_page, browser):
    from tests.components.pages import pager

    await start_page(pager.page)

    total_pages = math.ceil(len(pager.items) / 10)

    await browser.wait_for_text_to_equal('#num_pages', str(total_pages))

    for i in range(total_pages):
        start = i * 10
        stop = (i + 1) * 10
        if stop > len(pager.items):
            stop = len(pager.items)

        items = pager.items[start:stop]

        cells = await browser.wait_for_elements_by_css_selector('.grid-cell')

        cells = [int(cell.text) for cell in cells]

        assert items == cells

        try:
            button = await browser.wait_for_element_by_xpath(
                f"//*[@id='pager']/span[contains(text(), 'next')]",
                timeout=1,
            )
            button.click()
            await asyncio.sleep(0.5)
        except:
            assert stop == len(pager.items)
