import typing


class _Undefined(object):
    """
    Mark a difference between None and not supplied.
    The user can set a value to None and we should take it into account when
    serializing the component to include that aspect.
    A falsy check is not enough.
    """
    _singleton = None  # There can only be one, like None
    __slots__ = ()  # no attribute can be added.

    @classmethod  # important, otherwise not the good __new__
    def __new__(cls, *args, **kwargs):
        if not cls._singleton:
            cls._singleton = super(_Undefined, cls).__new__(*args, **kwargs)
            return cls._singleton
        raise Exception('There can only be one UNDEFINED')

    def __repr__(self):
        return 'undefined'

    def __str__(self):
        return 'undefined'

    def __bool__(self):
        return False


# Includes None for non required aspects to be set to None/null
Undefined = typing.Union[_Undefined, None]

UNDEFINED = _Undefined()
