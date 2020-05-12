import secrets

from ._undefined import UNDEFINED


__all__ = [
    'Aspect', 'Component', 'prepare_aspects'
]


# noinspection PyProtectedMember
def prepare_aspects(aspects: dict):
    data = {}
    for aspect, value in aspects.items():
        if value is not UNDEFINED:
            if isinstance(value, Component):
                data[aspect] = value._prepare()
            elif isinstance(value, (list, tuple)):
                new_value = []
                for x in value:
                    if isinstance(x, Component):
                        new_value.append(x._prepare())
                    elif isinstance(x, dict):
                        new_value.append(prepare_aspects(x))
                    else:
                        new_value.append(x)
                data[aspect] = new_value
            elif isinstance(value, dict):
                data[aspect] = prepare_aspects(value)
            else:
                data[aspect] = value
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

    def _paths(self, parent=''):
        path = f'{parent + "." if parent else ""}{self.identity}'
        yield path, self
        for key in self._children:
            value = getattr(self, key, UNDEFINED)
            if value is not UNDEFINED:
                if isinstance(value, Component):
                    for p, nested in value._paths(path):
                        yield p, nested
                elif isinstance(value, list):
                    for component in (
                            x for x in value if isinstance(x, Component)
                    ):
                        # noinspection PyProtectedMember
                        for p, nested in component._paths(path):
                            yield p, nested
                else:
                    yield f'{path}.{key}', value

    def __repr__(self):
        return f'<[{self._package_name}.{self.__class__.__name__}]' \
            f' ({self.identity})>'
