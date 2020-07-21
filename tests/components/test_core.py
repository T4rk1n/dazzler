"""Core components tests"""
import asyncio
import itertools
import functools
import json

import pytest
from selenium.webdriver import ActionChains
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.select import Select

from dazzler import Dazzler
from dazzler.components import core
from dazzler.system import Page


@pytest.mark.async_test
async def test_input_output(start_page, browser):
    from tests.components.pages.input_output import page, text_inputs

    await start_page(page)

    for identity, value in zip(
            text_inputs,
            ['foo', 'bar', '555-555-5555', 'password', 't@e.com']
    ):
        component = await browser.wait_for_element_by_id(identity)
        component.send_keys(value)

        await browser.wait_for_text_to_equal(
            f'#{identity}-output', f'{identity} value {value}'
        )

    number = await browser.wait_for_element_by_id('number')
    last = 0
    for i in itertools.chain(range(1, 25), range(25, 1, -1)):
        if i > last:
            number.send_keys(Keys.ARROW_UP)
        else:
            number.send_keys(Keys.ARROW_DOWN)
        last = i
        await browser.wait_for_text_to_equal(
            '#number-output', f'number value {i}'
        )

    checkbox = await browser.wait_for_element_by_id('checkbox')
    for i in range(20):
        checkbox.click()
        await browser.wait_for_text_to_equal(
            '#checkbox-output', f'Checked: {"True" if i % 2 == 0 else "False"}'
        )


@pytest.mark.parametrize(
    'tag_name, attributes',
    [
        ('a', {'href': 'http://localhost:8150/', 'children': 'home'}),
        ('p', {'children': 'paragraph'}),
        ('button', {'children': 'click me'}),
        ('canvas', {'height': 600, 'width': 800}),
        ('progress', {'value': 50, 'max': 200}),
        ('textarea', {'rows': 6, 'cols': 80})
    ]
)
@pytest.mark.async_test
async def test_html_single(start_page, browser, tag_name, attributes):
    # Test attributes are set and render.
    page = Page(__name__, core.Html(
        tag_name, attributes=attributes, identity='html'
    ))
    await start_page(page)

    component = await browser.wait_for_element_by_id('html')

    for k, v in attributes.items():
        if k == 'children':
            await browser.wait_for_text_to_equal('#html', v)
        else:
            attr = component.get_attribute(k)
            assert attr == str(v)


@pytest.mark.async_test
async def test_html_events(start_page, browser):
    from tests.components.pages.html import page

    await start_page(page)

    click = await browser.wait_for_element_by_id('click')
    click.click()

    output = json.loads(
        (await browser.wait_for_element_by_id('click-output')).text
    )

    assert output['type'] == 'click'

    focus = await browser.wait_for_element_by_id('focus')
    focus.send_keys('hello')

    output = json.loads(
        (await browser.wait_for_element_by_id('focus-output')).text
    )
    assert output['type'] == 'focus'
    focus.send_keys('\t')
    output = json.loads(
        (await browser.wait_for_element_by_id('focus-output')).text
    )
    assert output['type'] == 'blur'

    mouse = await browser.wait_for_element_by_id('mouse')
    action = ActionChains(browser.driver)
    action.move_to_element(mouse).perform()

    output = json.loads(
        (await browser.wait_for_element_by_id('mouse-output')).text
    )
    assert output['type'] == 'mouseenter'


@pytest.mark.async_test
async def test_store(start_page, browser):
    # This store only in memory, plan is to have get-storage for local/session
    # directly on the page websocket/BindingContext.
    # So you'd have the latest and can mitigate more race conditions.
    from tests.components.pages.store import page, store_types

    await start_page(page)

    await browser.wait_for_text_to_equal(
        '#initial-output', json.dumps({'foo': 'bar'})
    )

    get_aspect_click = await browser.wait_for_element_by_id('get-aspect-click')
    get_aspect_click.click()
    await browser.wait_for_text_to_equal(
        '#get-aspect-output', json.dumps({'foo': 'bar'})
    )

    # Click uses as state and trigger. / set-aspect
    click = await browser.wait_for_element_by_id('click')

    for i in range(1, 25):
        click.click()
        await browser.wait_for_text_to_equal(
            '#click-output', json.dumps({'clicks': i})
        )

    type_clicker = await browser.wait_for_element_by_id('type-click')
    for i, store in enumerate(store_types):
        type_clicker.click()

        expected = store[0][2](store[1])
        try:
            await browser.wait_for_text_to_equal(
                '#type-output', expected
            )
        except Exception as e:
            raise AssertionError(
                'Failed to update from'
                f' {i - 1}:{store_types[i - 1][0][0]} '
                f'to {i}:{store[0][0]} ::expected:: {expected}'
            ) from e


@pytest.mark.async_test
async def test_interval(start_page, browser):
    from tests.components.pages.interval import page

    await start_page(page)
    await browser.wait_for_text_to_equal('#output', 'Times: 6')

    await asyncio.sleep(2)

    await browser.wait_for_text_to_equal('#output', 'Times: 6')

    checkbox = await browser.wait_for_element_by_id('toggle')
    checkbox.click()

    await asyncio.sleep(2)

    checkbox.click()

    output = await browser.wait_for_element_by_id('output')

    num = int(output.text.replace('Times: ', ''), )
    assert num > 6


@pytest.mark.parametrize('options', [
    [1],
    [1, 2],
    [5, 6, 7, 8, 9],
    [10, 8, 9, 1, 7, 4, 3],
    list(range(1, 12)),
    [10, 9, 9, 10, 1, 2, 3, 4],
    [1, 2, 3, 3, 4, 5, 6, 6, 6, 7, 9, 9, 10, 10, 10, 10, 10],
    [2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4]
])
@pytest.mark.async_test
async def test_checklist(start_page, browser, options):
    from tests.components.pages.checklist import page

    await start_page(page)

    for i in options:
        checkbox = await browser.wait_for_element_by_css_selector(
            f'#checklist label:nth-child({i}) input'
        )
        checkbox.click()

    output = json.loads((await browser.wait_for_element_by_id('output')).text)

    def remove_dupes(arr: list, value):
        if value in arr:
            arr.remove(value)
        else:
            arr.append(value)
        return arr

    doubled = set(functools.reduce(remove_dupes, options, []))
    output = set(output)
    assert len(doubled.difference(output)) == 0


@pytest.mark.parametrize('selected', [
    [1],
    [1, 2],
    [1, 1, 2, 3, 4, 5],
    list(range(1, 12)),
    list(range(11, 0, -1))
])
@pytest.mark.async_test
async def test_radio(start_page, browser, selected):
    from tests.components.pages.radio import page

    await start_page(page)

    for i in selected:
        radio = await browser.wait_for_element_by_css_selector(
            f'#radio label:nth-child({i}) input'
        )
        radio.click()

        await browser.wait_for_text_to_equal('#output', f'Selected: {i}')


@pytest.mark.parametrize('initial', list(range(1, 12)))
@pytest.mark.async_test
async def test_radio_initial(start_page, browser, initial):
    from tests.components.pages.radio import page, radio
    radio.value = initial

    await start_page(page)

    await browser.wait_for_text_to_equal('#output', f'Selected: {initial}')


@pytest.mark.async_test
async def test_link(start_visit, browser):
    from tests.components.pages.link import page, other_page

    app = Dazzler(__name__)
    app.add_page(page, other_page)
    await start_visit(app)

    link = await browser.wait_for_element_by_id('internal')
    await app.executor.execute(link.click)

    external = await browser.wait_for_element_by_id('external')
    external.click()

    await asyncio.sleep(0.1)

    assert 'https://www.google.com/' in browser.driver.current_url


@pytest.mark.async_test
async def test_data_list(start_page, browser):
    from tests.components.pages.datalist import page

    await start_page(page)

    datalist = await browser.wait_for_element_by_css_selector(
        '#datalist input'
    )
    datalist.send_keys('Foo')

    await browser.wait_for_text_to_equal('#output', 'foo')


@pytest.mark.async_test
async def test_viewport(start_page, browser):
    from tests.components.pages.viewport import page, views, tabs

    await start_page(page)
    for view in itertools.chain(views, reversed(views)):
        click = await browser.wait_for_element_by_id(f'toggle-{view}')
        click.click()
        await browser.wait_for_text_to_equal('#viewport', view)

    for view in reversed(views):
        modify = await browser.wait_for_element_by_id(f'modify-{view}')
        modify.click()
        click = await browser.wait_for_element_by_id(f'toggle-{view}')
        click.click()
        await browser.wait_for_text_to_equal('#viewport', f'Modified {view}')

    tab_elements = await browser.wait_for_elements_by_css_selector(
        '.dazzler-tab'
    )
    for tab, elem in zip(reversed(tabs), reversed(tab_elements)):
        # assert tab labels were used
        assert elem.text == tab.upper()
        elem.click()
        await browser.wait_for_text_to_equal('#tabs .view-content', tab)


@pytest.mark.async_test
async def test_progress(start_page, browser):
    from tests.components.pages.progress import page

    await start_page(page)

    progress_btn = await browser.wait_for_element_by_id('progress-btn')
    container = await browser.wait_for_element_by_id('progress')
    width = float(container.value_of_css_property('width').replace('px', ''))

    for i in range(1, 101):
        progress_btn.click()
        await browser.wait_for_text_to_equal('#counter', str(i))

        progress = await browser.wait_for_element_by_css_selector(
            '#progress .progress'
        )
        pw = float(progress.value_of_css_property('width').replace('px', ''))
        diff = (width * (i / 100)) - pw
        assert -.5 <= diff <= 0.5


@pytest.mark.async_test
async def test_select(start_page, browser):
    from tests.components.pages.select import page

    await start_page(page)

    elem = Select(await browser.wait_for_element_by_css_selector('#select'))
    multi = Select(await browser.wait_for_element_by_css_selector('#multi'))
    for i in range(10, 0, -1):
        elem.select_by_value(str(i))
        await browser.wait_for_text_to_equal('#output', str(i))

        multi.select_by_value(str(i))

        await asyncio.sleep(0.01)

        output = set(
            json.loads(
                (await browser.wait_for_element_by_id('multi-output')).text
            )
        )
        assert len(set(range(10, i + 10, -1)).difference(output)) == 0

    multi.deselect_all()
    await asyncio.sleep(0.01)
    output = set(
        json.loads(
            (await browser.wait_for_element_by_id('multi-output')).text
        )
    )
    assert len(output) == 0


@pytest.mark.async_test
async def test_button(start_page, browser):
    from tests.components.pages.button import page

    await start_page(page)

    for i in range(1, 14):
        await browser.click('#button')
        await browser.wait_for_text_to_equal('#output', f'clicked: {i}')


@pytest.mark.skip('Mouse control not working good.')
@pytest.mark.async_test
async def test_slider(start_page, browser):
    # Basic acceptance test, needs more cases.
    # Drag n drop/mouse movement is buggy with selenium,
    #  not sure it works on macs
    from tests.components.pages.slider import page

    await start_page(page)

    handle = await browser.wait_for_element_by_css_selector(
        '#slider .slider-handle'
    )
    stop = await browser.wait_for_element_by_id('stop')
    start = await browser.wait_for_element_by_id('start')

    async def get_value():
        return float(
            (
                await browser.wait_for_element_by_id('output')
            ).text.replace('slider: ', '')
        )

    async def move_to(to):
        await browser.executor.execute(
            ActionChains(browser.driver)
            .move_to_element(handle)
            .click_and_hold(handle)
            .move_to_element(to)
            .release(to)
            .perform
        )
        to.click()
        await asyncio.sleep(0.2)

    initial = await get_value()
    assert initial == -20

    await move_to(stop)

    value = await get_value()
    assert value > initial

    initial = value

    start.click()
    await asyncio.sleep(0.2)

    await move_to(start)
    value = await get_value()
    assert value < initial


@pytest.mark.async_test
async def test_modal(start_page, browser):
    from tests.components.pages.modal import page

    await start_page(page)

    await browser.click('#show')

    await browser.wait_for_text_to_equal(
        '#modal .modal-header', 'modal header'
    )
    await browser.wait_for_text_to_equal(
        '#modal .modal-body', 'modal body'
    )
    await browser.wait_for_text_to_equal(
        '#modal .modal-footer', 'modal footer'
    )


@pytest.mark.async_test
async def test_textarea(start_page, browser):
    from tests.components.pages.textarea import page

    await start_page(page)

    textarea = await browser.wait_for_element_by_id('textarea')
    textarea.send_keys('textarea test')

    await browser.wait_for_text_to_equal('#output', 'textarea test')

    autosizer = await browser.wait_for_element_by_id('autosizer')
    await browser.wait_for_style_to_equal('#autosizer', 'height', '40px')
    autosizer.send_keys('e' * 54)
    await browser.wait_for_style_to_equal('#autosizer', 'height', '58px')


@pytest.mark.async_test
async def test_grid(start_page, browser):
    from tests.components.pages.grid import page

    await start_page(page)

    rows = await browser.wait_for_elements_by_css_selector('.grid-row')

    assert len(rows) == 10

    for row in rows:
        assert len(row.find_elements_by_css_selector('.grid-cell')) == 10


@pytest.mark.async_test
async def test_form(start_page, browser):
    from tests.components.pages.form import page

    await start_page(page)

    field = await browser.wait_for_element_by_css_selector('.form-input')
    field.send_keys('Foo bar')

    await browser.click('.form-submit')

    await browser.wait_for_text_to_equal('#output', 'Foo bar')


@pytest.mark.parametrize(
    'operation, max_size, times, multiplier',
    [
        ('append', None, 3, 1),
        ('append', 10, 10, 1),
        ('prepend', None, 3, 1),
        ('prepend', 10, 10, 1),
        ('concat', None, 3, 2),
        ('concat', 10, 5, 3),
        ('concat', 10, 5, 10),
        ('insert', None, 1, 4),
        ('insert', 10, 5, 1),
    ]
)
@pytest.mark.async_test
async def test_list_box_additions(
        start_page, browser, operation, max_size, times, multiplier
):
    from tests.components.pages import list_box

    list_box.lb_component.max_length = max_size
    original_size = len(list_box.lb_component.items)

    await start_page(list_box.page)

    multiplier_input = await browser.wait_for_element_by_id('index-input')
    multiplier_input.send_keys(str(multiplier))

    for i in range(1, times + 1):
        await browser.click(f'#{operation}-btn')
        await asyncio.sleep(0.1)

        items = await browser.wait_for_elements_by_css_selector('.item')

        if max_size:
            assert len(items) <= max_size
        else:
            assert len(items) == original_size + (
                    i * (multiplier if operation != 'insert' else 1)
            )

        if operation == 'insert':
            inserted = items[multiplier]
            assert 'insert' in inserted.get_attribute('class')


@pytest.mark.async_test
async def test_list_box_deletions(start_page, browser):
    from tests.components.pages import list_box

    original_size = len(list_box.lb_component.items)

    await start_page(list_box.page)
    index_input = await browser.wait_for_element_by_id('index-input')
    index_input.send_keys('0')
    await browser.click('#delete-btn')

    items = await browser.wait_for_elements_by_css_selector('.item')

    assert len(items) == original_size - 1


@pytest.mark.async_test
async def test_simple_dropdown(start_page, browser):
    from tests.components.pages.dropdown import page

    await start_page(page)

    for i in range(1, 6):
        await browser.click('#simple-dropdown .drop-toggle')
        await browser.click(f'#simple-dropdown .opened > div:nth-child({i})')
        await browser.wait_for_text_to_equal('#simple-output', str(i))


@pytest.mark.async_test
async def test_multi_dropdown(start_page, browser):
    from tests.components.pages.dropdown import page

    await start_page(page)

    for i in range(1, 11):

        await browser.click('#multi-dropdown .drop-toggle')
        await browser.click(f'#multi-dropdown .opened > div:nth-child({i})')

        output = set(
            json.loads(
                (await browser.wait_for_element_by_id('multi-output')).text
            )
        )
        assert len(set(range(10, i + 10, -1)).difference(output)) == 0


@pytest.mark.async_test
async def test_search_backend(start_page, browser):
    from tests.components.pages.dropdown import page

    await start_page(page)

    async def get_options():
        return await browser.wait_for_elements_by_css_selector(
            '#search-backend-dropdown .dropdown-item'
        )

    search_input = await browser.wait_for_element_by_css_selector(
        '#search-backend-dropdown .dropdown-search-input'
    )

    search_input.send_keys('f')

    options = await get_options()

    assert len(options) == 1
    assert options[0].text == 'foo'

    search_input.send_keys(Keys.BACKSPACE)
    search_input.send_keys('hel')

    options = await get_options()

    assert len(options) == 3

    search_input.send_keys('l')

    assert len(await get_options()) == 2
    search_input.send_keys('o')
    assert len(await get_options()) == 1
