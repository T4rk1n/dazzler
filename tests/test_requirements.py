"""Requirements specifics tests"""
import pytest

from dazzler.errors import InvalidRequirementError, InvalidRequirementKindError
from dazzler.system import Requirement, RequirementWarning


@pytest.mark.parametrize(
    'filename, kind, uri_key, formatted_tag',
    [
        ('bundle.js', 'js', 'src', '<script src="/dazzler/requirements/static/dist/bundle.js"></script>'),  # noqa: E501
        ('bundle.js.map', 'map', 'href', ''),
        ('bundle.css', 'css', 'href', '<link rel="stylesheet" type="text/css" href="/dazzler/requirements/static/dist/bundle.css">'),  # noqa: E501
    ]
)
def test_requirement(filename, kind, uri_key, formatted_tag):
    requirement = Requirement(filename)
    prepared = requirement.prepare()
    tag = requirement.tag()

    assert requirement.kind == kind
    assert uri_key in prepared['attributes']
    assert tag == formatted_tag


def test_dev_requirements():
    # Assert dev requirements are handled the proper flag is set.
    requirement = Requirement(
        '/home/project/dist/requirements.js',
        dev='/home/project/dev/dev-requirements.js'
    )
    prepared = requirement.prepare(dev=True)
    assert prepared['url'] == '/dazzler/requirements/static/dev/dev-requirements.js'  # noqa: E501

    tag = requirement.tag(dev=True)
    assert 'src="/dazzler/requirements/static/dev/dev-requirements.js"' in tag


def test_external_requirements():
    # Assert external requirements are served when the flag is set.
    requirement = Requirement(
        internal='requirements.js',
        external='http://t.com/external-requirements.js'
    )
    prepared = requirement.prepare(external=True)
    assert prepared['url'] == 'http://t.com/external-requirements.js'

    # Assert crossorigin is set for external files.
    assert 'crossorigin' in prepared['attributes']

    tag = requirement.tag(external=True)
    assert ' crossorigin ' in tag


# error tests
def test_invalid_requirements():

    with pytest.raises(InvalidRequirementError):
        Requirement()


def test_invalid_requirement_kind():
    with pytest.raises(InvalidRequirementKindError) as context:
        req = Requirement('invalid.xxx')
        req.tag()

    assert context.value.args[0] == 'Invalid requirement kind: xxx'


def test_external_only_warning():

    with pytest.warns(RequirementWarning) as record:
        Requirement(external='external-only')

    assert len(record) == 1
    assert record[0].message.args[0] == 'No local file for requirement: external-only'  # noqa: E501
