# A bit of duplication of the component system tests to ensure
# typescript components are transpiled properly to Python.
# Types are tested in test_mypy.
import json
import re

import pytest

from . import ts_components as tsc


def test_tsc_required():
    with pytest.raises(TypeError) as context:
        tsc.TypedComponent()

    assert context.value.args[0] == "__init__() missing 1 required positional argument: 'required_str'"  # noqa: E501


def test_tsc_docstring():
    assert tsc.TypedComponent.__doc__.strip() == 'Typed Component Docstring'


def test_tsc_aspect_docstring():
    assert ':param str_with_comment: Docstring'\
           in tsc.TypedComponent.__init__.__doc__


@pytest.mark.parametrize('prop_name, prop_default', [
    ('default_str', "'default'"),
    ('default_required_str', "'default required'"),
    ('default_num', 3)
])
def test_tsc_default_props_docstring(prop_name, prop_default):
    pattern = r':param {}:.*\(default={}\)'.format(prop_name, prop_default)
    assert re.search(pattern, str(tsc.TypedComponent.__init__.__doc__))


def test_tsc_enum_docstring():
    assert ":param enumeration: (Possible values: 'foo', 'bar')" \
           in tsc.TypedComponent.__init__.__doc__


@pytest.mark.async_test
async def test_tsc_render(start_page, browser):
    from tests.components.pages.ts import page

    await start_page(page)

    # assert the children with added classname + base class name css path.
    await browser.wait_for_text_to_equal(
        '.dazzler-ts-typed-component.other .children .dazzler-core-container',
        'foobar'
    )

    # assert style can be changed, is added to the type by extension.
    await browser.wait_for_style_to_equal(
        '.dazzler-ts-typed-component.other',
        'border', '1px solid rgb(0, 0, 255)'
    )

    content = await browser.wait_for_element_by_css_selector(
        '.dazzler-ts-typed-component.other .json-output'
    )
    data = json.loads(content.text)

    assert data['num'] == 2
    assert data['text'] == 'foobar'
    assert data['arr'] == [1, 2, 'mixed']
    assert data['arr_str'] == ['foo', 'bar']
    assert data['default_str'] == 'default'
    assert data['required_str'] == 'override'
    assert data['obj'] == {'anything': 'possible'}
