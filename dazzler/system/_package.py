import typing


from dazzler.errors import PackageConflictError

from ._requirements import Requirement
from ._component import Component


class Package:
    package_registry = {}

    def __init__(
            self,
            name: str,
            components: typing.List[Component] = None,
            requirements: typing.List[Requirement] = None,
            routes: list = None,
    ):
        if name in self.package_registry:
            raise PackageConflictError(f'Duplicate package name: {name}')

        self.name = name
        self.components = {}

        for component in (components or []):
            setattr(component, '_package_name', self.name)

            self.components[component.__name__] = component

        self.requirements = requirements or []
        self.routes = routes or []
        self.package_registry[self.name] = self

    def prepare(self, dev=False, external=False):
        return {
            'name': self.name,
            'components': list(self.components.keys()),
            'requirements': [
                x.prepare(dev=dev, external=external)
                for x in self.requirements
            ],
        }

    def __str__(self):
        return self.name

    def __repr__(self):
        return f'<Package "{self.name}">'
