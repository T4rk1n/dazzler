import secrets

from ._undefined import UNDEFINED


__all__ = [
    'Aspect', 'Component', 'prepare_aspects'
]


# noinspection PyProtectedMember
def prepare_aspect(value):
    if value is not UNDEFINED:
        if isinstance(value, Component):
            return value._prepare()
        if isinstance(value, (list, tuple)):
            return [prepare_aspect(y) for y in value]
        if isinstance(value, dict):
            return prepare_aspects(value)
    return value


# noinspection PyProtectedMember
def prepare_aspects(aspects: dict):
    data = {}
    for aspect, value in aspects.items():
        if value is not UNDEFINED:
            data[aspect] = prepare_aspect(value)
    return data


def _generate_identity():
    return hex(secrets.randbits(40)).lstrip('0x')


# noinspection PyProtectedMember
class Aspect:
    """
    Aspects of component are represented on both backend and frontend.
    """
    def __init__(
            self,
            name=None,
            default=UNDEFINED,
            required=False,
            children=False,
            docstring=None,
    ):
        self.name = name
        self.default = default
        self.required = required
        self.children = children
        self.__doc__ = docstring

    def __set_name__(self, owner, name):
        self.name = name
        owner._aspects_keys.append(name)
        if self.children:
            owner._children.append(name)

    def __get__(self, instance, owner):
        if instance is None:
            return self
        value = instance._aspects.get(self.name, UNDEFINED)
        return value

    def __set__(self, instance, value):
        if self.default is not UNDEFINED \
                and self.default == value \
                and not instance._initialized:
            return
        instance._aspects[self.name] = value


class Component:
    _aspects_keys = []
    _package_name = ''
    _children = []

    def __init__(
            self,
            aspects,
            identity: str = None,
    ):
        self.identity = identity or _generate_identity()
        self._initialized = False
        self._aspects = {}
        for k, v in aspects.items():
            if k in ('self', 'args', 'kwargs', 'identity'):
                continue
            setattr(self, k, v)
        self._initialized = True

    def _prepare(self) -> dict:
        return {
            'name': self.__class__.__name__,
            'identity': self.identity,
            'package': self._package_name,
            'aspects': prepare_aspects(self._aspects),
        }

    def __repr__(self):
        return f'<[{self._package_name}.{self.__class__.__name__}]' \
            f' ({self.identity})>'
