"""
Main integrations test
"""
import json

import pytest


@pytest.mark.async_test
async def test_click_output(browser):
    # This test ensure that binding works.
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
    # Bindings can return components successfully.
    from tests.apps.binding_return_component import app

    await app.main(blocking=False)

    await browser.get('http://localhost:8150/')

    clicker = await browser.wait_for_element_by_id('clicker')

    clicker.click()
    await browser.wait_for_text_to_equal('#from-binding', 'from binding')

    await app.stop()


@pytest.mark.async_test
async def test_layout_as_function(browser):
    # Functions can be used as layout to be evaluated on page request.
    from tests.apps.layout_as_function import app

    await app.main(blocking=False)

    await browser.get('http://localhost:8150')
    await browser.wait_for_text_to_equal('#layout', 'Layout as function')

    await app.stop()


@pytest.mark.async_test
async def test_generated_component_trigger_binding(browser):
    # A component not in the initial layout can trigger other binding.
    from tests.apps.generated_component_trigger_binding import app

    await app.main(blocking=False)

    await browser.get('http://localhost:8150')
    click = await browser.wait_for_element_by_id('click')
    click.click()

    click_twice = await browser.wait_for_element_by_id('generated')
    click_twice.click()

    await browser.wait_for_text_to_equal('#output2', 'Generated')
    await app.stop()


@pytest.mark.async_test
async def test_click_with_state(browser):
    from tests.apps.click_output import app
    await app.main(blocking=False)

    await browser.get('http://localhost:8150/')

    clicker = await browser.wait_for_element_by_id('clicker')
    dropdown = await browser.wait_for_element_by_css_selector('#dropdown input')

    dropdown.send_keys('Foo')
    clicker.click()

    await browser.wait_for_text_to_equal('#datalist-output', 'Data foo')
    await app.stop()


@pytest.mark.async_test
async def test_bindings_continue_after_error(browser, capsys):
    from tests.apps.bindings_continue_after_error import app
    await app.main(blocking=False)

    await browser.get('http://localhost:8150/')
    clicker = await browser.wait_for_element_by_id('click')
    clicker_err = await browser.wait_for_element_by_id('click-error')

    clicker.click()

    await browser.wait_for_text_to_equal('#output', 'Clicked 1')

    clicker_err.click()
    clicker.click()

    await browser.wait_for_text_to_equal('#output', 'Clicked 2')

    _, err = capsys.readouterr()
    # Assert the error was logged.
    assert 'Clicked error' in err

    await app.stop()


@pytest.mark.async_test
async def test_aspect_rendering(browser):
    from tests.apps import aspect_rendering

    app = aspect_rendering.app
    types = aspect_rendering.aspect_types

    await app.main(blocking=False)
    await browser.get('http://localhost:8150/')

    for name, aspect in types.items():
        btn = await browser.wait_for_element_by_id(f'set-{name}')
        btn.click()
        expected = aspect['value']
        if aspect.get('json'):
            expected = json.dumps(expected, separators=(',', ':'))
        else:
            expected = str(expected)

        await browser.wait_for_text_to_equal(f'#spec-output .{name}', expected)
