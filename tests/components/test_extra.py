"""Extra components tests"""
import asyncio
import math

import pytest
from selenium.common.exceptions import TimeoutException


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
                '//*[@id=\'pager\']/span[contains(text(), \'next\')]',
                timeout=1,
            )
            button.click()
            await asyncio.sleep(0.5)
        except TimeoutException:
            assert stop == len(pager.items)


@pytest.mark.async_test
async def test_treeview(start_page, browser):
    from tests.components.pages.treeview import page

    await start_page(page)

    # Click on first nest
    await browser.click('.level-0:nth-child(2)')
    await browser.wait_for_text_to_equal('#output', 'nest')

    # Expect sub items to show up
    await browser.wait_for_text_to_equal('.level-1:nth-child(1)', 'nested1')

    # Subnest
    await browser.click('.level-1:nth-child(3)')
    await browser.wait_for_text_to_equal('#output', 'nest.subnest')

    await browser.click('.level-2:nth-child(1)')
    await browser.wait_for_text_to_equal('#output', 'nest.subnest.sub1')

    # Unselect
    await browser.click('.level-2:nth-child(1)')
    await browser.wait_for_text_to_equal('#output', 'nest.subnest')

    # Click on level before and expect the subnest to still be open (clickable)
    await browser.click('.level-1:nth-child(1)')
    await browser.wait_for_text_to_equal('#output', 'nest.nested1')

    await browser.click('.level-2:nth-child(2)')
    await browser.wait_for_text_to_equal('#output', 'nest.subnest.sub2')

    # Close subnest
    await browser.click('div.level-1:nth-child(3) .tree-item-label')
    await browser.wait_for_text_to_equal('#output', 'nest')

    sub_containers = await browser.wait_for_elements_by_css_selector(
        '.tree-sub-items'
    )
    assert len(sub_containers) == 1


@pytest.mark.async_test
async def test_color_picker(browser, start_page):
    from tests.components.pages.color_picker import page

    await start_page(page)

    await browser.wait_for_style_to_equal(
        '#colored-toggle.dazzler-extra-color-picker '
        '.dazzler-color-picker-toggle '
        '.toggle-button-color',
        'background-color',
        'rgba(255, 0, 0, 1)'
    )
