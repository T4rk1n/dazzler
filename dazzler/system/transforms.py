"""Ties & transform API"""
import typing
from ._binding import Target, coerce_binding


class Transform:
    """
    **Execution order: Recursive Left to Right**
    """

    def __init__(self):
        self.args = {}
        self.next = []

    def transform(self, transform):
        """
        Add a transform to chain after this one and all the previously added
        transforms.

        :param transform: Transformation to apply.
        :type transform: Transform
        :return: self
        """
        self.next.append(transform)
        return self

    def t(self, transform):
        return self.transform(transform)

    def prepare(self):
        return {
            'transform': self.__class__.__name__,
            'args': {
                k: v.prepare() if hasattr(v, 'prepare') else v
                for k, v in self.args.items()
            },
            'next': [n.prepare() for n in self.next]
        }


class TiedTransform:
    def __init__(self, trigger, targets):
        """
        :param trigger: The aspect starting a tie chain on update.
        :type trigger: dazzler.system.Trigger
        :param targets: Aspects to update.
        :type targets: typing.List[dazzler.system.Target]
        """
        self.trigger = trigger
        self.targets = targets
        self.transforms = []

    def transform(self, transform: Transform):
        self.transforms.append(transform)
        return self

    def t(self, transform: Transform):
        return self.transform(transform)

    def prepare(self):
        return {
            'trigger': self.trigger.prepare(),
            'targets': [t.prepare() for t in self.targets],
            'transforms': [t.prepare() for t in self.transforms],
        }


class _Transformable(Transform):
    def __init__(self, transform: Transform):
        super().__init__()
        self.args['transform'] = transform


class _Comparable(Transform):
    def __init__(self, comparison: Transform):
        super().__init__()
        self.args['comparison'] = comparison


class _ValueTransform(Transform):
    def __init__(self, value: typing.Any):
        super().__init__()
        self.args['value'] = value


class _TargetTransform(Transform):
    def __init__(self, target: typing.Union[str, Target]):
        super().__init__()
        self.args['target'] = coerce_binding(target, Target)


class _Comparison(Transform):
    def __init__(self, other):
        super().__init__()
        self.args['other'] = other


# Number transform
class Add(_ValueTransform):
    """Perform an addition on the chain value."""


class Sub(_ValueTransform):
    """Subtract values."""


class Divide(_ValueTransform):
    """Division operation Left / Right"""


class Multiply(_ValueTransform):
    """Multiply chain value * value"""


class Modulus(_ValueTransform):
    """Perform a modulus operation on the chain."""


class ToPrecision(Transform):

    def __init__(self, precision: int):
        super().__init__()
        self.args['precision'] = precision


# String transform

class Format(Transform):
    """
    Format the value into the template.

    Template format: ``${key}``

    For primitive values (string, numbers), the value will be formatted in
    ``${value}`` template key.

    Objects are formatted with their keys items formatted with the value.

    .. code-block:: python

        from dazzler.system.transforms import RawValue, Format

        RawValue('foo').Format('${value} bar')
        # => 'foo bar'

        RawValue({'a': 'foo', 'b': 'bar'}).Format('${a} ${b}')
        # => 'foo bar'

        RawValue(['foo', 'bar']).Format('${0} ${1}')
        # => 'foo bar'
    """

    def __init__(self, template: str):
        super().__init__()
        self.args['template'] = template


class Split(Transform):
    """Split a string value into a list."""
    def __init__(self, separator: str):
        super().__init__()
        self.args['separator'] = separator


class ToLower(Transform):
    """Transform a string chained value to lower case."""


class ToUpper(Transform):
    """Transform a string chained value to upper case."""


class Trim(Transform):
    """Trim whitespace around a chained string value."""


# List transforms

class Concat(Transform):
    """
    Concat a list or string into a new string/list containing entries
    from both sides.
    """

    def __init__(self, other: typing.Union[list, str]):
        super().__init__()
        self.args['other'] = other


class Slice(Transform):
    """Take a slice of a list from ``start`` to ``stop``."""

    def __init__(self, start: int, stop: int):
        super().__init__()
        self.args['start'] = start
        self.args['stop'] = stop


class Map(_Transformable):
    """
    Map a chained array values.
    """


class Reduce(_Transformable):
    """Reduce the list value"""


class Filter(_Comparable):
    """Filter elements of the list"""


class Pluck(Transform):
    """
    Take a value at ``field`` from a list of objects.

    .. code-block:: python

        from dazzler.system.transforms import RawValue, Pluck

        RawValue([{'a': 1, 'b': 2, 'c': 3}]).t(Pick('a'))
        # => [1]
    """
    def __init__(self, field: str):
        super().__init__()
        self.args['field'] = field


class Append(_ValueTransform):
    """Append a value a the end of the chained list."""


class Prepend(_ValueTransform):
    """Prepend a value at the beginning of the list."""


class Insert(_TargetTransform):
    """Insert the value into the target list."""
    def __init__(self, target, front=False):
        super().__init__(target)
        self.args['front'] = front


class Take(Transform):
    """Take the first `n` elements of the list."""
    def __init__(self, n: int):
        super().__init__()
        self.args['n'] = n


class Length(Transform):
    """Resolve the length of the list."""


class Range(Transform):
    """Return an array of number from ``start`` to ``end``"""
    def __init__(self, start: int, end: int, step: int = 1):
        super().__init__()
        self.args['start'] = start
        self.args['end'] = end
        self.args['step'] = step


class Includes(_ValueTransform):
    """True if value is included in the chained list."""


class Find(_Comparable):
    """
    Find an item in a list with a comparison.

    .. code-block:: python

        from dazzler.system.transforms import RawValue, Find, Get, Equals

        RawValue([{'a': 'a', 'b': 'b'}, {'a': 'b', 'b': 'a'}])\
            .transform(Find(Get('a').t(Equals('b'))))
        # => {'a': 'b', 'b': 'a'}
    """


class Join(Transform):
    def __init__(self, separator):
        super().__init__()
        self.args['separator'] = separator


class Reverse(Transform):
    """Reverse a string or array elements."""


class Unique(Transform):
    """Filter duplicates out of the list."""


class Zip(_ValueTransform):
    """Associates values from each list"""


class Sort(_Transformable):
    """Sort transform should return a number"""


class ToPairs(Transform):
    """Transform an object into pairs of [key, value]"""


class FromPairs(Transform):
    """Transform a list of list of key value pairs into an object."""


# Object transforms
class Pick(Transform):
    """
    Pick the fields of the object.

    .. code-block:: python

        from dazzler.system.transforms import RawValue, Pick

        RawValue({'a': 1, 'b': 2, 'c': 3}).t(Pick(['a', 'b']))
        # => {'a': 1, 'b': 2}
    """
    def __init__(self, fields: typing.List[str]):
        super().__init__()
        self.args['fields'] = fields


class Get(Transform):
    """Get the field value of the chain object."""
    def __init__(self, field: str):
        super().__init__()
        self.args['field'] = field


class Set(Transform):
    """
    Set the key value on the trigger value.

    Value can be raw or a :py:class:`dazzler.system.Target` aspect.
    """
    def __init__(self, key: str, value: typing.Any):
        """

        :param key:
        :param value:
        """
        super().__init__()
        self.args['key'] = key
        self.args['value'] = value


class Put(Transform):
    """
    Put the value at key on target

    Target should be a dict or a `~.dazzler.system.Target` aspect
    resolving to a dict.
    """
    def __init__(self, key: str, target):
        super().__init__()
        self.args['key'] = key
        self.args['target'] = target


class Merge(Transform):
    """
    Merge a chained ``dict`` value with another ``dict``, either raw value
    or a :py:class:`~.dazzler.system.Target` aspect.

    .. code-block:: python

        from dazzler.system.transforms import RawValue, Merge

        RawValue({'a': 1}).transform(Merge({'b': 2}))
        # => {'a': 1, 'b': 2}
    """
    def __init__(self, other, direction='right', deep=False):
        super().__init__()
        self.args['other'] = other
        self.args['direction'] = direction
        self.args['deep'] = deep


class ToJson(Transform):
    """Serialize the chain value to JSON."""


class FromJson(Transform):
    """Parse the chain value from JSON."""


# Conditionals

class If(_Comparable):
    """
    Initiate a comparison on the value.

    ``then`` is execute if the comparison is ``True`` else ``otherwise`` will
    be executed if defined.

    .. code-block:: python

        from dazzler.system.transforms import If, RawValue, Equals, Format

        RawValue('foo').t(If(Equals('foo'), then=Format('${value} bar')))
    """
    def __init__(self, comparison, then, otherwise=None):
        super().__init__(comparison)
        self.args['then'] = then
        self.args['otherwise'] = otherwise


class Equals(_Comparison):
    pass


class NotEquals(_Comparison):
    pass


class Match(_Comparison):
    pass


class Greater(_Comparison):
    pass


class GreaterOrEquals(_Comparison):
    pass


class Lesser(_Comparison):
    pass


class LesserOrEquals(_Comparison):
    pass


class And(_Comparison):
    pass


class Or(_Comparison):
    pass


class Not(Transform):
    pass


class RawValue(_ValueTransform):
    """Resolve a raw value."""


class AspectValue(_TargetTransform):
    """Resolve the target value."""
