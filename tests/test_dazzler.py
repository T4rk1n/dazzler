"""
Main integrations test
"""
import asyncio
import json

import pytest
from selenium.webdriver.common.keys import Keys


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
async def test_multi_page(start_visit, browser):
    from tests.apps.multi_page import app

    await start_visit(app)

    for num in ('one', 'two', 'three', 'four'):
        await browser.get(f'http://localhost:8150/{num}')
        await browser.wait_for_text_to_equal('#content', f'Page {num}')


@pytest.mark.async_test
async def test_binding_return_component(start_visit, browser):
    # Bindings can return components successfully.
    from tests.apps.binding_return_component import app

    await start_visit(app)

    await browser.get('http://localhost:8150/')

    await browser.click('#clicker')
    await browser.wait_for_text_to_equal('#from-binding', 'from binding')


@pytest.mark.async_test
async def test_layout_as_function(start_visit, browser):
    # Functions can be used as layout to be evaluated on page request.
    from tests.apps.layout_as_function import app

    await start_visit(app)

    await browser.get('http://localhost:8150')
    await browser.wait_for_text_to_equal('#layout', 'Layout as function')


@pytest.mark.async_test
async def test_generated_component_trigger_binding(start_visit, browser):
    # A component not in the initial layout can trigger other binding.
    from tests.apps.generated_component_trigger_binding import app

    await start_visit(app)

    await browser.click('#click')
    await browser.click('#generated')

    await browser.wait_for_text_to_equal('#output2', 'Generated')


@pytest.mark.async_test
async def test_click_with_state(start_page, browser):
    from tests.apps.pages.click_output import page

    await start_page(page)

    dropdown = await browser.wait_for_element_by_css_selector(
        '#dropdown input'
    )

    dropdown.send_keys('Foo')
    await browser.click('#clicker')

    await browser.wait_for_text_to_equal('#datalist-output', 'Data foo')


@pytest.mark.async_test
async def test_bindings_continue_after_error(start_visit, browser):
    from tests.apps.bindings_continue_after_error import app
    await start_visit(app)

    clicker = await browser.wait_for_element_by_id('click')
    clicker_err = await browser.wait_for_element_by_id('click-error')

    clicker.click()

    await browser.wait_for_text_to_equal('#output', 'Clicked 1')

    clicker_err.click()
    clicker.click()

    await browser.wait_for_text_to_equal('#output', 'Clicked 2')

    # FIXME Bug with caplog and the logger not working.
    # _, err = capsys.readouterr()
    # BUG with something. err is '' yet it is printed.
    # assert 'Clicked error' in err


@pytest.mark.async_test
async def test_aspect_rendering(start_visit, browser):
    from tests.apps import aspect_rendering

    app = aspect_rendering.app
    types = aspect_rendering.aspect_types

    await start_visit(app)

    for name, aspect in types.items():
        await browser.click(f'#set-{name}')
        expected = aspect['value']
        if aspect.get('json'):
            expected = json.dumps(expected, separators=(',', ':'))
        else:
            expected = str(expected)

        await browser.wait_for_text_to_equal(f'#spec-output .{name}', expected)


@pytest.mark.async_test
async def test_binding_set_aspect_trigger_error(start_page, browser):
    # Setting the aspect that triggered should raise an error
    from tests.apps.pages.binding_set_aspect_trigger_error import page

    await start_page(page)

    await browser.click('#click-error')

    # Use a output container to assert the error was raised instead.
    expected = 'Setting the same aspect that triggered: click-error.clicks'
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

    await browser.click('#trigger-1')

    await browser.wait_for_text_to_equal('#output', 'output generated')


@pytest.mark.async_test
async def test_binding_tree(start_page, browser):
    # This ensure that updates are not handled synchronously
    # in the order they come in and waited until the first one completes.
    from tests.apps.pages.binding_tree import page
    await start_page(page)

    await browser.click('#trigger')

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

    await browser.click('#starter')
    await browser.click('#updater')

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

    await browser.click('#click-error')

    await browser.wait_for_text_to_equal(
        '#error-output', 'Aspect not found invalid.error'
    )


@pytest.mark.async_test
async def test_component_as_trigger(start_page, browser):
    from tests.apps.pages.component_as_trigger import page

    await start_page(page)

    await browser.wait_for_text_to_equal(
        '#output', 'From component: from children'
    )

    await browser.wait_for_text_to_equal('#array-output', 'Sum: 45')

    nested = json.loads(
        (await browser.wait_for_element_by_id('nested-output')).text
    )

    assert nested['len'] == 2
    assert nested['insider'] == 'inside html div'
    assert nested['as_prop'] == 'attribute'

    (await browser.wait_for_element_by_id('get-aspect-trigger')).click()

    await asyncio.sleep(0.1)
    output = json.loads(
        (await browser.wait_for_element_by_id('get-aspect-output')).text
    )

    assert output['get-aspect'] == 'input-value'
    assert output['state'] == 4747


@pytest.mark.async_test
async def test_binding_return_trigger(start_page, browser):
    # This test that returned components can trigger bindings.
    from tests.apps.pages.binding_return_trigger import page

    await start_page(page)

    for i in range(1, 25):
        await browser.click('#click')
        await browser.wait_for_text_to_equal(
            '#trigger-output', f'from click {i}'
        )


@pytest.mark.skip(
    'Not really important as you can set directly on the component'
    ' instead of returning the same component in the same spot.')  # FIXME
@pytest.mark.async_test
async def test_same_identity(start_page, browser):
    # There is bug which you cannot set component with same identity as root.
    # but contained children works as per test_binding_return_trigger.
    # So setting the children aspect with the same component but updated values
    # doesn't work.
    from tests.apps.pages.same_identity import page

    await start_page(page)

    for _ in range(1, 25):
        clicker = await browser.wait_for_element_by_id('click')
        clicker.click()

        await browser.wait_for_property_to_equal('#same', 'value', 1)


@pytest.mark.async_test
async def test_component_as_aspect(start_page, browser):
    from tests.apps.pages.component_as_aspect import page

    await start_page(page)

    (await browser.wait_for_element_by_id('click-sum')).click()
    await browser.wait_for_text_to_equal('#sum-output', 'Sum 45')

    for i in range(1, 12):
        component = await browser.wait_for_element_by_id(f'array-{i}')
        for j in range(25):
            await browser.wait_for_text_to_equal(
                f'#output-array-{i}', f'array-{i} value: {i+j}'
            )
            component.send_keys(Keys.ARROW_UP)

    for identity in ('single', 'shaped'):
        for i in range(1, 25):
            await browser.click(f'#{identity}')
            await browser.wait_for_text_to_equal(
                f'#{identity}-output', f'Click {identity}: {i}'
            )


@pytest.mark.async_test
async def test_storage(start_page, browser):
    from tests.apps.pages.storage import page

    await start_page(page)

    getter = 'return JSON.parse(window.{}.getItem("data"));'
    local_getter = getter.format('localStorage')
    session_getter = getter.format('sessionStorage')

    for store, getter in zip(
            ['local', 'session'], [local_getter, session_getter]
    ):
        for i in range(1, 25):
            await browser.click(f'#{store}-btn')
            await browser.wait_for_text_to_equal(
                f'#{store}-output', json.dumps({'clicks': i})
            )
            stored = browser.driver.execute_script(getter)

            assert stored['clicks'] == i

    await browser.executor.execute(browser.driver.refresh)
    await asyncio.sleep(1)
    stored = browser.driver.execute_script(local_getter)
    assert stored['clicks'] == 24


@pytest.mark.async_test
async def test_prefer_external(start_visit, browser):
    from tests.apps.prefer_external import app

    await start_visit(app)

    scripts = await browser.wait_for_elements_by_xpath(
        '//script[contains(@src, '
        '"https://unpkg.com/react@16.8.6/umd/react.production.min.js")]'
    )
    assert len(scripts) == 1


@pytest.mark.async_test
async def test_global_requirements(start_visit, browser):
    from tests.apps.app_requirements import app

    await start_visit(app)
    await browser.get('http://localhost:8150/')

    scripts = await browser.wait_for_elements_by_xpath(
        '//script[contains(@src, "withRequirements.js")]'
    )
    assert len(scripts) == 1
