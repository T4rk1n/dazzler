import os as _os

from dazzler.system import Package as _Package, Requirement as _Req

from dazzler._assets import (
    assets as _assets,
    assets_dev as _dev,
    assets_dist_path as _dist_path,
    assets_dev_path as _dev_path,
)

from ._imports_ import *
from ._imports_ import __all__ as _components

_name = 'test'
_package_name = f'dazzler_{_name}'


package = _Package(
    _package_name,
    components=_components,
    requirements=[
        _Req(
            _os.path.join(_dist_path, _x['name']),
            dev=_os.path.join(_dev_path, _y['name']),
            package=_package_name
        )
        for _x, _y in zip(_assets[_name], _dev[_name])
    ]
)
