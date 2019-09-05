import os

from dazzler.tools import replace_all, format_tag, get_package_path, OrderedSet


def test_get_package_path():
    path = get_package_path(__name__)
    assert path == os.path.dirname(__file__)


def test_replace_all():
    template = '%(foo)-%(bar)-%(foo)'
    assert replace_all(template, foo='bar', bar='foo') == 'bar-foo-bar'


def test_format_tag():
    tag = format_tag('div', {'id': 'foo', 'class': 'bar'})
    assert tag == '<div id="foo" class="bar"></div>'


def test_ordered_set():
    ordered = OrderedSet('foo', 'bar', 'foo')
    assert len(ordered) == 2
    assert list(ordered) == ['foo', 'bar']
    ordered.add('bar')
    assert len(ordered) == 2
