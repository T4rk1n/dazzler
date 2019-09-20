import os
import re

import pytest

from dazzler.system import Component, Aspect
from . import spec_components as spec


def test_simple_component():
    # Sanity test.
    class SimpleComponent(Component):
        simple = Aspect()

    component = SimpleComponent({'simple': 'foo'})
    assert component.simple == 'foo'


def test_missing_required_aspect():
    # Missing required props should raise an informative Error.
    with pytest.raises(TypeError) as context:
        # pylint: disable=no-value-for-parameter
        spec.TestComponent()

    assert context.value.args[0] == "__init__() missing 1 required positional argument: 'required_string'"  # noqa: E501


def test_undefined_aspects():
    t = spec.TestComponent('')
    output = t._prepare()
    assert 'string_prop' not in output['aspects']


def test_null_aspects():
    # Test aspects can be set to None and included in prepare if not required.
    t = spec.TestComponent('', string_prop=None)
    output = t._prepare()
    assert output['aspects']['string_prop'] is None


def test_default_aspects_not_in_prepare():
    # Default aspects should not be in output
    # as they are handled on the frontend
    component = spec.TestComponent('')
    output = component._prepare()
    assert 'string_with_default' not in output['aspects']


def test_default_aspect_can_be_changed():
    # Default aspects can be changed
    component = spec.TestComponent('')
    component.string_with_default = 'Non default'
    assert component._prepare()['aspects']['string_with_default'] == 'Non default'  # noqa: E501


@pytest.mark.skip('No initial bind trigger (yet) & logic for this was slow.')
def test_default_aspect_set_default():
    # Set the default value should be included.
    component = spec.TestComponent('', string_with_default='Foo')
    output = component._prepare()
    assert 'string_with_default' in output['aspects']


def test_default_aspect_set_default_after_init():
    # Set after init with default should be included
    component = spec.TestComponent('')
    component.string_with_default = 'Foo'
    output3 = component._prepare()
    assert output3['aspects']['string_with_default'] == 'Foo'


@pytest.mark.parametrize('prop_name, prop_default', [
    ('string_default', "'Default string'"),
    ('string_default_empty', "''"),
    ('number_default', 0.2666),
    ('number_default_empty', 0),
    ('array_default', r'\[1, 2, 3\]'),
    ('array_default_empty', r'\[\]'),
    ('object_default', "{foo: 'bar'}"),
    ('object_default_empty', '{}'),
])
def test_default_props_docstring(prop_name, prop_default):
    # Test default props are formatted in the docstring.
    pattern = r':param {}:.*\(default={}\)'.format(prop_name, prop_default)
    assert re.search(pattern, str(spec.DefaultProps.__init__.__doc__))


def test_enum_docstring():
    assert ":param enum_prop: (Possible values: 'News', 'Photos')" \
           in spec.TestComponent.__init__.__doc__


@pytest.mark.parametrize('aspect, value', [
    ('string_prop', 'string value'),
    ('number_prop', 1),
    ('number_prop', 1.5),
    ('bool_prop', True),
    ('object_prop', {'foo': 'bar'}),
    ('children', spec.TestComponent('', id='tc')),
])
def test_set_aspect(aspect, value):
    component = spec.TestComponent('')
    setattr(component, aspect, value)
    output = component._prepare()
    assert output['aspects'][aspect] == value \
        if not isinstance(value, Component) else value._prepare()


def test_docstring_length():
    # The length of each line of the generated docstring should be < 80
    docstring = spec.TestComponent.__init__.__doc__.split(os.linesep)

    for line in docstring:
        assert len(line) < 80, f'len({line}) > 79'
        assert '(default=UNDEFINED)' not in line


def test_iter_components():
    component = spec.TestComponent(
        '', identity='root', children=spec.TestComponent(
            '', identity='child',
            children=[
                'first',
                spec.TestComponent('', identity='one'),
                spec.TestComponent('', identity='two')
            ]
        )
    )
    n_components = 0

    for path, component in component._paths():
        n_components += 1
        assert isinstance(component, Component)
        if n_components == 1:
            assert path == 'root'
        elif n_components == 2:
            assert 'child' in path
        elif n_components == 3:
            assert 'child.one' in path
        elif n_components == 4:
            assert 'child.two' in path

    assert n_components == 4
