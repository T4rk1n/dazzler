import pathlib
import re
import os
import warnings

# Create a data dir for the requirements once and for all.
import typing

from dazzler.tools import format_tag

from dazzler.errors import (
    InvalidRequirementError, InvalidRequirementKindError
)


class RequirementWarning(UserWarning):
    pass


class Requirement:
    """Represents a static asset to include as dependency for rendering."""
    def __init__(
            self,
            internal: str = None,
            kind: str = None,
            name: str = None,
            package: str = None,
            dev: str = None,
            external: str = None,
            page: str = None
    ):
        """
        :param internal: Local path of the requirement to include on the page.
        :param kind: The file extension.
        :param name: The file name.
        :param package: The package related to this requirement.
        :param dev: Local path of the dev asset to serve instead of internal
            when running in debug mode.
        :param external: URL to serve instead when running with
            ``prefer_external`` mode enable in the configs.
        :param page: The page related to this requirement.
        """
        if internal is None and external is None:
            raise InvalidRequirementError(
                'Please give either an internal or external file'
            )

        self.internal = internal
        self.name = name or os.path.basename(internal or external)
        self.kind = kind or self.name.split(os.extsep)[-1]
        self.dev = dev
        self.external = external
        self.external_only = external and not internal
        self.internal_only = internal and not external

        paths = ['dist', self.name]
        url = ['/dazzler', 'requirements', 'static', 'dist', self.name]
        if package:
            paths.insert(0, package)
            url.insert(3, package)

        if page:
            paths.insert(0, page)
            url.insert(3, page)

        self.internal_static = os.path.join(*paths)
        self.internal_url = '/'.join(url)

        if dev:
            paths[paths.index('dist')] = 'dev'
            dev_name = os.path.basename(dev)
            paths[paths.index(self.name)] = dev_name
            self.dev_static = os.path.join(*paths)
            url[url.index('dist')] = 'dev'
            url[url.index(self.name)] = dev_name
            self.dev_url = '/'.join(url)

        if self.external_only:
            warnings.warn(
                f'No local file for requirement: {self.external}',
                RequirementWarning
            )

    def prepare(self, dev=False, external=False) -> dict:
        attributes = {}
        if self.kind == 'js':
            uri_key = 'src'
        else:
            uri_key = 'href'
            if self.kind == 'css':
                attributes['rel'] = 'stylesheet'
                attributes['type'] = 'text/css'

        if self.external_only:
            uri = self.external
        elif dev and self.dev:
            uri = self.dev_url
        elif external and self.external:
            uri = self.external
            attributes['crossorigin'] = ('{key}', 'crossorigin')
        else:
            uri = self.internal_url

        attributes[uri_key] = uri

        return {
            'kind': self.kind,
            'url': uri,
            'attributes': attributes
        }

    def tag(self, dev=False, external=False):
        prepared = self.prepare(dev, external)
        if self.kind == 'css':
            return format_tag(
                'link', prepared['attributes'], opened=True, close=False
            )
        if self.kind == 'js':
            return format_tag('script', prepared['attributes'])
        if self.kind == 'map':
            return ''
        raise InvalidRequirementKindError(
            f'Invalid requirement kind: {self.kind}'
        )

    def __str__(self):
        return self.internal or self.external

    def __repr__(self):
        return self.tag()


def assets_to_requirements(
        path: str, data: dict,
        dev_data: dict = None,
        dev_path: str = None,
        package_name: str = None,
        external: str = None
) -> typing.List[Requirement]:
    """
    Turns the output of webpack-bundle-tracker into a list of Requirements

    :param path: Path where production assets are located
    :param data: Bundle tracker data.'
    :param dev_data: Bundle tracker dev data, if not provided take data.
    :param dev_path: Path where dev assets are located.
    :param package_name: The name of the package if used for packages.
    :param external: External base path for the requirement.
    :return:
    """
    dev_data = dev_data or data
    dev_path = dev_path or path

    return [
        Requirement(
            internal=os.path.join(path, internal['name']),
            dev=os.path.join(dev_path, dev['name']),
            package=package_name,
            external=f'{external}/{internal["name"]}' if external else None
        )
        for internal, dev in zip(data, dev_data)
    ]


def collect_requirements(directory: str, page: str = None):
    """
    Collect all js/css files in the directory and map them as requirement

    :param directory:
    :param page:
    :return:
    """
    requirements = []

    for current, _, files in os.walk(directory):
        for file in sorted(
                (
                    x for x in files
                    if x.endswith('.js') or x.endswith('.css')
                ),
                key=lambda k: [
                    int(x) if x.isdigit() else x
                    for x in re.split('([0-9]+)', k)
                ]
        ):
            path = os.path.join(current, file)
            requirements.append(
                Requirement(
                    internal=path,
                    page=page,
                    name=str(pathlib.Path(path).relative_to(directory))
                )
            )
    return requirements
