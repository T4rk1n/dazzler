import subprocess
import sys
import shlex

from textwrap import dedent

import pytest


template = dedent('''
import tests.components.spec_components as tc

t = tc.TestComponent({})
''').strip()


def run_mypy(code):
    """
    Execute mypy in a subprocess, returns the output and status code.

    :param code: The Python code for mypy to evaluate.
    :return: Output, Error, Status code.
    """
    cmd = shlex.split(
        'mypy -c "{}" --python-executable {} --allow-untyped-globals'.format(
            code, sys.executable
        ),
        posix=sys.platform != 'win32',
        comments=True
    )
    proc = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    out, err = proc.communicate()
    return out.decode(), err.decode(), proc.poll()


def assert_mypy_output(code,
                       expected_outputs=tuple(),
                       expected_errors=tuple(),
                       expected_status=0):
    output, error, status = run_mypy(code)
    assert status == expected_status, \
        f'Status: {status}\nOutput: {output}\nError: {error}'
    for ex_out in expected_outputs:
        assert ex_out in output
    for ex_err in expected_errors:
        assert ex_err in error


@pytest.mark.parametrize('arguments, assertions', [
    (
        '',
        {
            'expected_status': 1,
            'expected_outputs': ['Missing positional argument "required_string"']  # noqa: E501
        }
    ),
    (
        '1',
        {
            'expected_status': 1,
            'expected_outputs': [
                'Argument 1 to "TestComponent" has incompatible type "int"; expected "str"'  # noqa: E501
            ]
        }
    ),
    (
        "'hello'",  # Double quote gets eaten by shlex
        {
            'expected_status': 0,
        }
    ),
    (
        "'', bool_prop='not bool'",
        {
            'expected_status': 1,
            'expected_outputs': [
                'Argument "bool_prop" to "TestComponent" has incompatible type "str"; expected "Optional[bool]"'  # noqa: E501
            ]
        }
    ),
    (
        "'', bool_prop=True",
        {
            'expected_status': 0
        }
    ),
    (
        "'', number_prop='not number'",
        {
            'expected_status': 1,
            'expected_outputs': [
                'error: Argument "number_prop" to "TestComponent" has incompatible type "str"; expected "Union[float, int, None]"'  # noqa: E501
            ]
        }
    ),
    (
        "'', number_prop=3",
        {
            'expected_status': 0
        }
    ),
    (
        "'', number_prop=5.1",
        {
            'expected_status': 0
        }
    ),
    (
        "'', string_prop=3",
        {
            'expected_status': 1,
            'expected_outputs': [
                'error: Argument "string_prop" to "TestComponent" has incompatible type "int"; expected "Optional[str]"'  # noqa: E501
            ]
        }
    ),
    (
        "'', array_prop='not array'",
        {
            'expected_status': 1,
            'expected_outputs': [
                ' error: Argument "array_prop" to "TestComponent" has incompatible type "str"; expected "Optional[List[Any]]"'  # noqa: E501
            ]
        }
    ),
    (
        "'', array_prop=[1,2,3]",
        {
            'expected_status': 0
        }
    ),
    # Enum not supported for now, it is Any
    pytest.param(
        "'', enum_prop=2",
        {
            'expected_status': 1,
            'expected_outputs': [
                'expected "Union[str, Undefined]'
            ]
        },
        marks=pytest.mark.skip
    ),
    (
        "'', union_prop=[]",
        {
            'expected_status': 1,
            'expected_outputs': [
                'Argument "union_prop" to "TestComponent" has incompatible type "List[<nothing>]"; expected "Union[str, float, int, None]"'  # noqa: E501
            ]
        }
    ),
    (
        "'', union_prop=1",
        {
            'expected_status': 0,
        }
    ),
    (
        "'', union_prop='foo'",
        {
            'expected_status': 0,
        }
    ),
    (
        "'', array_of_prop=['foo', 'bar']",
        {
            'expected_status': 1,
            'expected_outputs': [
                'List item 0 has incompatible type "str"; expected "float"',
                'List item 1 has incompatible type "str"; expected "float"'
            ]
        }
    ),
    (
        "'', array_of_prop=[1, 'bar']",
        {
            'expected_status': 1,
            'expected_outputs': [
                'List item 1 has incompatible type "str"; expected "float'
            ]
        }
    ),
    (
        "'', array_of_prop=[1, 2.1, 3]",
        {
            'expected_status': 0
        }
    ),
    (
        "'', object_of_prop={'foo', 'bar'}",
        {
            'expected_status': 1,
            'expected_outputs': [
                'error: Argument "object_of_prop" to "TestComponent" has incompatible type "Set[str]"; expected "Optional[Dict[str, Union[float, int]]]"'  # noqa: E501
            ]
        }
    ),
    (
        "'', object_of_prop={'foo': 'bar'}",
        {
            'expected_status': 1,
            'expected_outputs': [
                'Dict entry 0 has incompatible type "str": "str"; expected "str": "float"'  # noqa: E501
            ]
        }
    ),
    (
        "'', object_of_prop={'good': 1, 'foo': 'bar'}",
        {
            'expected_status': 1,
            'expected_outputs': [
                'Dict entry 1 has incompatible type "str": "str"; expected "str": "float"'  # noqa: E501
            ]
        }
    ),
    (
        "'', object_of_prop={'good': 1, 'foo': 100}",
        {
            'expected_status': 0
        }
    ),
    (
        "'', shape_prop=''",
        {
            'expected_status': 1,
            'expected_outputs': [
                'error: Argument "shape_prop" to "TestComponent" has incompatible type "str"; expected "Optional[Dict[str, Union[str, float, int]]]"'  # noqa: E501
            ]
        }
    ),
    # FIXME this edge case is not caught by mypy, but pycharm catches it.
    pytest.param(
        "'', shape_prop={'color': True}",
        {
            'expected_status': 1,
            'expected_outputs': [
                'Dict entry 0 has incompatible type "str": "bool"; expected "str": "str"'  # noqa: E501
            ]
        },
        marks=pytest.mark.skip
    ),
    (
        "'', shape_prop={'color': [1,2,3,4]}",
        {
            'expected_status': 1,
            'expected_outputs': [
                'Dict entry 0 has incompatible type "str": "List[int]"; expected "str": "Union[str, float]"'  # noqa: E501
            ]
        }
    ),
    # Not supported by typing module.
    pytest.param(
        "'', shape_prop={'color': 0, 'fontSize': 'foo'}",
        {
            'expected_status': 1,
            'expected_outputs': [
                'Dict entry 0 has incompatible type "str": "float"; expected "str": "str"'  # noqa: E501
                'Dict entry 1 has incompatible type "str": "str"; expected "str": "float"'  # noqa: E501
            ]
        }, marks=pytest.mark.skip
    ),
    (
        "'', string_prop=None",
        {
            'expected_status': 0
        }
    ),
    (
        "'', children=tc.TestComponent('hello')",
        {
            'expected_status': 0,
        }
    ),
    (
        "'', children=[tc.TestComponent('child1'), tc.TestComponent('child2')]",  # noqa: E501
        {
            'expected_status': 0,
        }
    ),
    (
        "'', children=[tc, tc]",
        {
            'expected_status': 1,
            'expected_outputs': [
                'List item 0 has incompatible type Module; expected "Union[str, float, Component]"',  # noqa: E501
                'List item 1 has incompatible type Module; expected "Union[str, float, Component]"'  # noqa: E501
            ]
        }
    ),
    (
        "'', children=tc",
        {
            'expected_status': 1,
            'expected_outputs': [
                'Argument "children" to "TestComponent" has incompatible type Module; expected "Union[str, int, float, Component, List[Union[str, int, float, Component]], None]"'  # noqa: E501
            ]
        }
    )
])
def test_mypy_validations(arguments, assertions):
    """
    Test parametrized props and assertions.

    :param arguments: String of props to give to ComponentTest init.
    :param assertions: Assertions after running mypy on the component.
    :return:
    """
    assert_mypy_output(template.format(arguments), **assertions)
