import json

import pytest

from tests.apps import aspect_rendering


@pytest.mark.async_test
async def test_aspect_rendering(browser):
    app = aspect_rendering.app
    types = aspect_rendering.aspect_types

    await app.main(blocking=False)
    await browser.get('http://localhost:5417/')

    for name, aspect in types.items():
        btn = await browser.wait_for_element_by_id(f'set-{name}')
        btn.click()
        expected = aspect['value']
        if aspect.get('json'):
            expected = json.dumps(expected, separators=(',', ':'))
        else:
            expected = str(expected)

        await browser.wait_for_text_to_equal(f'#spec-output .{name}', expected)
