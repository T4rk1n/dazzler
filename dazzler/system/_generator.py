import asyncio
import json
import keyword
import os
import sys
import textwrap
import re
import shlex

import stringcase

from ..tools import OrderedSet, replace_all
from .._assets import meta_path, meta_ts_path


def _default_prop_type(_):
    return 'typing.Any'


def _optional(value):
    return f'typing.Optional[{value}]'


def _json_or_undefined(obj):
    return json.dumps(obj) if obj else 'UNDEFINED'


def _default_prop_docstring_format(prop, defaults):
    value = defaults.get(prop)
    if not value:
        return ''
    return '(default={})'.format(value)


FILTERED_PROPS = (
    'updateAspects',
    'identity',
)

FILTERED_PROP_TYPES = (
    'func',
    'custom',
    'symbol',
    'instanceOf'
)

UNSUPPORTED_DEFAULT = (
    'array', 'arrayOf', 'object', 'objectOf', 'shape'
)


def generate_shape(t):
    props = OrderedSet(*(PROP_TYPING.get(  # type: ignore
        item['name'],
        _default_prop_type
    )(item) for item in t['value'].values()))
    if len(props) == 0:
        # ts Dict like object, {[key: string]: any} will be
        # an object with no props
        return 'typing.Any'
    return 'typing.Dict[str, typing.Union[{}]]'.format(', '.join(props))


# React PropTypes to Python typing
PROP_TYPING = {
    'array': lambda t: 'typing.List',
    'arrayOf': lambda t: 'typing.List[{}]'.format(
        PROP_TYPING.get(  # type: ignore
            t['value']['name'],
            _default_prop_type
        )(t['value'])
    ),
    'object': lambda t: 'typing.Dict',
    'shape': generate_shape,
    'string': lambda t: 'str',
    'bool': lambda t: 'bool',
    'number': lambda t: 'typing.Union[float, int]',
    # Node is ts JSX.Element, means anything renderable.
    'node': lambda t: 'typing.Union[str, int, float, Component,'
                      ' typing.List[typing.Union'
                      '[str, int, float, Component]]]',
    'func': _default_prop_type,
    'element': lambda t: 'Component',
    # oneOfType get serialized to union...
    'union': lambda t: 'typing.Union[{}]'.format(
        ', '.join(OrderedSet(*(
            PROP_TYPING.get(  # type: ignore
                x['name'],
                _default_prop_type
            )(x)
            for x in t['value']
        )))
    ),
    'any': _default_prop_type,
    'custom': _default_prop_type,
    # There is no proper typing support for enum.
    # It does a strange serialization (not json)
    # The possible values get formatted in the docstring.
    'enum': _default_prop_type,
    'objectOf': lambda t: 'typing.Dict[str, {}]'.format(
        PROP_TYPING.get(  # type: ignore
            t['value']['name'],
            _default_prop_type
        )(t['value'])
    )
}

DEFAULT_PROP_MAPPING = {
    'array': _json_or_undefined,
    'arrayOf': _json_or_undefined,
    'object': _json_or_undefined,
    'shape': _json_or_undefined,
    'string': lambda t: t,
    'bool': lambda t: str(str(t).lower() == 'true'),
    'number': str,
    'node': lambda t: 'UNDEFINED',
    'func': lambda t: 'UNDEFINED',
    'element': lambda t: 'UNDEFINED',
    'oneOf': str,
    'union': str,
    'any': str
}

COMPONENT_TYPENAME = (
    'node',
    'element'
)

POSSIBLE_COMPONENT_TYPENAME = COMPONENT_TYPENAME + (
    'arrayOf',
    'shape',
    'objectOf',
    'union'
)

TEMPLATE = '''
"""Autogenerated file: DO NOT EDIT!"""
import typing  # noqa: F401
from dazzler.system import Component, Aspect, UNDEFINED  # noqa: F401


class %(name)(Component):
    """
%(docstring)
    """
%(aspects)
    def __init__(
            self,
            %(aspects_init)
    ):
        """
        %(init_docstring)
        """
        Component.__init__(self, locals(), identity)
'''.strip()


def is_component_aspect(type_obj):
    type_name = type_obj['name']

    if type_name not in POSSIBLE_COMPONENT_TYPENAME:
        return False

    if type_name in COMPONENT_TYPENAME:
        return True

    if type_name in ('arrayOf', 'objectOf'):
        return is_component_aspect(type_obj['value'])
    if type_name == 'shape':
        return any(is_component_aspect(t) for t in type_obj['value'].values())
    if type_name == 'union':
        return any(is_component_aspect(t) for t in type_obj['value'])
    return False


# pylint: disable=too-many-locals, too-many-statements
def generate_component(display_name, description, props, output_path):
    aspects = []
    aspects_required = []
    aspects_optional = []
    init_docstring = []

    filtered_props = {
        k: v for k, v in props.items()
        if k not in FILTERED_PROPS
        and not k.endswith('*')
        and k not in keyword.kwlist
        and v.get('type', {}).get('name') not in FILTERED_PROP_TYPES
    }

    for name, prop in filtered_props.items():
        aspect_args = []
        required = prop.get('required')
        type_info = prop.get('type')
        if not type_info:
            print(f'Invalid prop: {display_name}.{name}', file=sys.stderr)
            continue
        type_name = type_info.get('name')
        default = prop.get('defaultValue')
        prop_description = prop.get('description', '')
        computed = default and default.get('computed')

        typed = PROP_TYPING.get(
            type_name,
            _default_prop_type
        )(type_info)

        docstring = ' ' + prop_description if prop_description else ''
        if type_name == 'enum':
            docstring += ' (Possible values: {})'.format(
                ', '.join(
                    x.get('value') for x in type_info.get('value')
                )
            )

        if required:
            init_value = f'{name}: {typed},'
            if len(init_value) > 67:
                init_value += '  # noqa: E501'
            aspects_required.append(init_value)
            aspect_args.append('required=True')
        else:
            if not default or computed or type_name in UNSUPPORTED_DEFAULT:
                mapped_default = 'UNDEFINED'
                if default and not computed:
                    doc_default = DEFAULT_PROP_MAPPING.get(
                        type_name,
                        json.dumps
                    )(default.get('value'))
                else:
                    doc_default = 'UNDEFINED'
            else:
                mapped_default = DEFAULT_PROP_MAPPING.get(
                    type_name,
                    json.dumps
                )(default.get('value'))
                doc_default = mapped_default
            if default and not computed:
                aspect_args.append(f'default={mapped_default}')
            if doc_default != 'UNDEFINED':
                if type_name in UNSUPPORTED_DEFAULT:
                    doc_default = doc_default.strip('"')
                docstring += f' (default={doc_default})'
            init_value = f'{name}: {_optional(typed)} = {mapped_default},'
            if len(init_value) > 66:
                init_value += '  # noqa: E501'
            aspects_optional.append(init_value)

        init_docstring.append(f'{os.linesep}            '.join(
            textwrap.fill(
                f':param {name}:{docstring}'.rstrip(), 67
            ).split(os.linesep)
        ))

        # Evaluate if the the prop can be a component
        if is_component_aspect(type_info):
            aspect_args.append('children=True')

        if docstring:
            aspect_args.append(
                f'docstring="{docstring.lstrip().replace(os.linesep, "")}"'
            )

        aspect = f'{name} = Aspect({", ".join(aspect_args)})'
        if len(aspect) > 75:
            aspect += '  # noqa: E501'
        aspects.append(aspect)

    if aspects:
        aspects.append('')

    aspects_optional.append('identity: str = None')

    # Enable example in docstring if they are after
    # @example with 4 spaces per lines.
    example = re.search(r'(?<=@example\n)(\s\s\s\s.*)+(?!@\w+)', description)
    if example:
        example = example.group()
        desc = description.replace(example, '').replace('@example', '').strip()
        example = f'\n\n:Example:\n\n.. code-block:: python3\n{example}'
    else:
        desc = description or ''
        example = ''

    component_string = replace_all(
        TEMPLATE,
        name=display_name,
        docstring=textwrap.indent(desc + example, '    '),
        aspects='\n'.join('    ' + x if x else x for x in aspects),
        aspects_init='\n            '.join(
            aspects_required + aspects_optional
        ),
        init_docstring='\n        '.join(init_docstring),
    ) + '\n'

    with open(output_path, 'w') as f:
        f.write(component_string)

    print(f'Generated {output_path}')


def generate_imports(output_path, components):
    with open(os.path.join(output_path, '_imports_.py'), 'w') as f:
        imports_string = '{}\n\n{}'.format(
            '\n'.join(
                'from ._{} import {}'.format(stringcase.snakecase(x), x)
                for x in components
            ),
            '__all__ = [\n{}\n]'.format(
                ',\n'.join('    "{}"'.format(x) for x in components))
        )
        imports_string += '\n'

        f.write(imports_string)


async def generate_meta(source_dir: str, ts: bool) -> dict:
    cmd = shlex.split(
        f'node {meta_ts_path if ts else meta_path} {source_dir}',
        posix=sys.platform != 'win32'
    )
    proc = await asyncio.create_subprocess_shell(
        ' '.join(cmd),
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    out, err = await proc.communicate()
    if err:
        print(err, file=sys.stderr)
        sys.exit(1)
    else:
        return json.loads(out.decode())


async def generate_components(metadata, output_path, executor):
    futures = []
    names = []

    for data in metadata.values():
        name = data['displayName']
        names.append(name)
        futures.append(
            executor.execute(
                generate_component,
                name,
                data['description'],
                data['props'],
                os.path.join(output_path, f'_{stringcase.snakecase(name)}.py')
            )
        )

    futures.append(executor.execute(generate_imports, output_path, names))

    with open(os.path.join(output_path, 'components.json'), 'w') as f:
        json.dump(names, f)

    await asyncio.gather(*futures)
