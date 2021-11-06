import os
import importlib

import stringcase


__all__ = [
    'get_package_path',
    'replace_all',
    'format_tag',
    'get_member',
    'transform_dict_keys',
]


def get_package_path(name):
    module = importlib.import_module(name)
    return os.path.dirname(module.__file__)


def get_member(member_path: str):
    """
    Import a module and retrieve a member from a module dot notation path
    separated by an ``:`` with the instance name.

    (eg: ``package.module:instance``)

    :param member_path: A string path with pattern
        ``package.module:member``
    :return:
    """
    split = member_path.split(':')
    if len(split) != 2:
        raise ImportError(
            'Invalid instance path syntax '
            '(eg: `package.module:instance`)'
        )
    module_name, instance_name = split
    module = importlib.import_module(module_name)
    return getattr(module, instance_name, None)


def replace_all(template, open_bracket='%(', end_bracket=')', **kwargs):
    t = template
    for k, v in kwargs.items():
        key = f'{open_bracket}{k}{end_bracket}'
        t = t.replace(key, str(v))
    return t


def format_tag(tag_name, attributes, content=None, opened=True, close=True):
    attrs = []
    for k, v in attributes.items():
        if isinstance(v, str):
            attrs.append(f'{k}="{v}"')
        else:
            fmt, value = v
            attrs.append(fmt.format(key=k, value=value))

    attr = ' '.join(attrs)
    tag = f'<{tag_name} {attr}'

    if opened:
        tag += '>'
    else:
        tag += '/>'

    if content:
        tag += content

    if close:
        tag += f'</{tag_name}>'

    return tag


def transform_dict_keys(data, casing=stringcase.camelcase):
    if not isinstance(data, dict):
        return data
    return {
        casing(k): transform_dict_keys(v, casing)
        for k, v in data.items()
    }
