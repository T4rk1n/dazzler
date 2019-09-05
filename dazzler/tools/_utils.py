import os
import importlib


__all__ = [
    'get_package_path',
    'replace_all',
    'format_tag'
]


def get_package_path(name):
    module = importlib.import_module(name)
    return os.path.dirname(module.__file__)


def replace_all(template, **kwargs):
    t = template
    for k, v in kwargs.items():
        t = t.replace(f'%({k})', str(v))
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
