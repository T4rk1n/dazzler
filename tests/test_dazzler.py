"""
Main integrations test
"""
import json

import pytest


@pytest.mark.async_test
async def test_click_output(start_page, browser):
    from tests.apps.pages.click_output import page

    await start_page(page)

    clicker = await browser.wait_for_element_by_id('clicker')

    for i in range(1, 25):
        clicker.click()

        await browser.wait_for_text_to_equal('#output', f'Clicked {i}')
        await browser.wait_for_style_to_equal(
            '#output', 'background-color',
            'rgba(255, 0, 0, 1)' if i % 2 == 1 else 'rgba(0, 0, 255, 1)'
        )


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
async def test_click_with_state(start_page, browser):
    from tests.apps.pages.click_output import page

    await start_page(page)

    clicker = await browser.wait_for_element_by_id('clicker')
    dropdown = await browser.wait_for_element_by_css_selector('#dropdown input')

    dropdown.send_keys('Foo')
    clicker.click()

    await browser.wait_for_text_to_equal('#datalist-output', 'Data foo')


@pytest.mark.async_test
async def test_bindings_continue_after_error(browser):
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
    await app.stop()

    # FIXME Bug with caplog and the logger not working.
    # _, err = capsys.readouterr()
    # BUG with something. err is '' yet it is printed.
    # assert 'Clicked error' in err


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

    await app.stop()


@pytest.mark.async_test
async def test_binding_set_aspect_trigger(start_page, browser):
    # Setting the aspect that triggered should raise an error
    from tests.apps.pages.binding_set_aspect_trigger import page

    await start_page(page)

    click = await browser.wait_for_element_by_id('click-error')
    click.click()

    # Use a output container to assert the error was raised instead.
    expected = 'Setting the same aspect that triggered: n_clicks@click-error'
    await browser.wait_for_text_to_equal('#error-output', expected)


@pytest.mark.async_test
async def test_trigger_on_removed_component(start_page, browser):
    from tests.apps.pages.trigger_on_removed_component import page

    await start_page(page)

    setter = await browser.wait_for_element_by_id('setter')
    remover = await browser.wait_for_element_by_id('remover')

    setter.click()

    await browser.wait_for_text_to_equal('#set-me', 'set')
    remover.click()
    await browser.wait_for_text_to_equal('#remove-inner', 'removed 1')
    setter.click()
    await browser.wait_for_text_to_equal('#done', 'done 2')

    # Can continue after error. Maybe add a specific error later.
    remover.click()
    await browser.wait_for_text_to_equal('#remove-inner', 'removed 2')


@pytest.mark.async_test
async def test_binding_chain(start_page, browser):
    # Updating an aspect from the backend should trigger
    # other connected bindings. (trigger-1 -> n bindings -> output)
    from tests.apps.pages.binding_chain import page
    await start_page(page)

    first = await browser.wait_for_element_by_id('trigger-1')
    first.click()

    await browser.wait_for_text_to_equal('#output', 'output generated')


@pytest.mark.async_test
async def test_binding_tree(start_page, browser):
    # This ensure that updates are not handled synchronously
    # in the order they come in and waited until the first one completes.
    from tests.apps.pages.binding_tree import page
    await start_page(page)

    trigger = await browser.wait_for_element_by_id('trigger')
    trigger.click()

    await browser.wait_for_text_to_equal('#done', 'done')
    output = json.loads((await browser.wait_for_element_by_id('output')).text)
    assert sum(output) == sum(range(1, 11))


@pytest.mark.async_test
async def test_dev_requirements(start_page, browser):
    # Make sure the dev requirements are served on page load when debug.
    from tests.apps.pages.click_output import page

    await start_page(page, debug=True)

    await browser.wait_for_element_by_xpath(
        '//script[@src="/dazzler/requirements/'
        'static/dev/react-16-8-6.development.js"]'
    )
    await browser.wait_for_element_by_xpath(
        '//script[contains(@src, '
        '"/dazzler/requirements/static/dazzler_core/dev/dazzler_core")]'
    )


@pytest.mark.async_test
async def test_initial_trigger(start_page, browser):
    from tests.apps.pages.initial_trigger import page

    await start_page(page)

    await browser.wait_for_text_to_equal(
        '#output', 'Input 10'
    )
    await browser.wait_for_text_to_equal(
        '#state-output', 'State 88'
    )


@pytest.mark.async_test
async def test_get_aspect(start_page, browser):
    from tests.apps.pages.get_aspect import page

    await start_page(page)

    starter = await browser.wait_for_element_by_id('starter')
    updater = await browser.wait_for_element_by_id('updater')

    starter.click()
    updater.click()

    await browser.wait_for_text_to_equal(
        '#done', 'done', timeout=30
    )

    result = json.loads(
        (await browser.wait_for_element_by_id('done-output')).text
    )

    assert sum(result) == sum(range(101))


@pytest.mark.async_test
async def test_get_aspect_error(start_page, browser):
    from tests.apps.pages.get_aspect_error import page

    await start_page(page)

    clicker = await browser.wait_for_element_by_id('click-error')
    clicker.click()

    await browser.wait_for_text_to_equal(
        '#error-output', 'Aspect not found invalid.error'
    )
