import json
import pytest

from selenium.webdriver.common.keys import Keys

from tests.apps.pages.transformations import page


async def get_json_store(browser, store_id):
    content = await browser.wait_for_element_by_id(store_id)
    return json.loads(content.text)


@pytest.mark.async_test
async def test_text_transform(start_page, browser):
    await start_page(page)
    text_input = await browser.wait_for_element_by_id('text-input')

    text_input.send_keys('fo')

    # Assert If otherwise
    await browser.wait_for_style_to_equal(
        '#text-output', 'color', 'rgba(0, 0, 255, 1)'
    )

    text_input.send_keys('o')
    # Assert If then
    await browser.wait_for_style_to_equal(
        '#text-output', 'color', 'rgba(0, 128, 0, 1)'
    )
    # Assert AspectValue + Merge doesn't erase existing props.
    await browser.wait_for_style_to_equal(
        '#text-output', 'font-weight', '700'
    )

    # Assert Add
    await browser.wait_for_text_to_equal('#text-output', 'foo bar')

    store = await get_json_store(browser, 'store-output')

    assert store['text-upper'] == 'FOO'

    text_input.send_keys(' BAR')
    store = await get_json_store(browser, 'store-output')

    assert store['text-lower'] == 'foo bar'
    assert len(store['text-split']) == 2

    await browser.wait_for_text_to_equal(
        '#formatted-object-output', '15 + 3 ='
    )


@pytest.mark.async_test
async def test_number_transforms(start_page, browser):
    await start_page(page)

    x_input = await browser.wait_for_element_by_id('number-input-1')
    y_input = await browser.wait_for_element_by_id('number-input-2')

    x = 15
    y = 3

    for i in range(0, 4):
        await browser.wait_for_text_to_equal(
            '#add-output', str((x + i) + (y + i))
        )
        await browser.wait_for_text_to_equal(
            '#sub-output', str((x + i) - (y + i))
        )
        await browser.wait_for_text_to_equal(
            '#mult-output', str((x + i) * (y + i))
        )
        await browser.wait_for_text_to_equal(
            '#div-output', str((x + i) / (y + i))
        )
        await browser.wait_for_text_to_equal(
            '#mod-output', str((x + i) % (y + i))
        )
        x_input.send_keys(Keys.ARROW_UP)
        y_input.send_keys(Keys.ARROW_UP)


@pytest.mark.async_test
async def test_list_transforms(start_page, browser):
    await start_page(page)

    async def click_store(button):
        await browser.click(button)
        return await get_json_store(browser, 'store-list-output')

    await browser.click('#range-btn')
    store = await click_store('#append-btn')

    assert len(store) == 10
    assert store[len(store) - 1] == 'appended'

    store = await click_store('#prepend-btn')

    assert len(store) == 11
    assert store[0] == 'prepended'

    store = await click_store('#insert-btn')

    assert len(store) == 12
    assert store[len(store) - 1] == 1

    store = await click_store('#concat-btn')

    assert len(store) == 15
    assert store[len(store) - 3] == 33

    await browser.click('#range-btn')
    store = await click_store('#slice-btn')

    assert len(store) == 4
    assert store[0] == 5

    store = await click_store('#map-btn')

    for i, value in enumerate(store):
        assert value == f'value: {i + 5}'

    # Skipping reduce for now since it's behavior is not very well defined.

    await browser.click('#range-btn')
    store = await click_store('#filter-btn')

    assert len(store) == 4

    for i in store:
        assert i > 5

    store = await click_store('#pluck-btn')

    assert store[0] == 'a'
    assert store[1] == 'b'

    await browser.click('#range-btn')
    store = await click_store('#take-btn')

    assert len(store) == 2

    await browser.click('#length-btn')
    await browser.wait_for_text_to_equal('#list-output', '2')

    await browser.click('#range-btn')
    await browser.click('#includes-btn')

    await browser.wait_for_text_to_equal(
        '#list-output', 'Include: true'
    )
    await browser.click('#reset-list-btn')
    await browser.click('#includes-btn')
    await browser.wait_for_text_to_equal(
        '#list-output', 'Include: false'
    )

    await browser.click('#find-btn')
    await browser.wait_for_text_to_equal(
        '#list-output', '{"a":"b","b":"a"}'
    )

    await browser.click('#range-btn')
    await browser.click('#join-btn')

    await browser.wait_for_text_to_equal(
        '#list-output', '1-2-3-4-5-6-7-8-9'
    )

    store = await click_store('#reverse-btn')

    assert store[0] == 9
    assert store[len(store) - 1] == 1

    store = await click_store('#unique-btn')

    assert len(store) == len(set(store))

    store = await click_store('#zip-btn')

    assert store[0][0] == 'a'
    assert store[0][1] == 1
    assert len(store) == 3


@pytest.mark.async_test
async def test_object_transforms(start_page, browser):
    await start_page(page)

    async def click_store(button):
        await browser.click(button)
        return await get_json_store(browser, 'store-object-output')

    await browser.click('#pick-btn')
    await browser.wait_for_text_to_equal(
        '#object-output', '{"a":"b","b":"a"}'
    )

    await browser.click('#get-btn')
    await browser.wait_for_text_to_equal(
        '#object-output', 'b'
    )

    store = await click_store('#set-btn')

    assert store['a'] == 'e'

    store = await click_store('#put-btn')

    assert store['a'] == 'o'

    store = await click_store('#merge-btn')

    assert store['e'] == 'o'
