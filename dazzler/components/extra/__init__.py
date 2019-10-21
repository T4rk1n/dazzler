from dazzler.system import (
    Package as _Package,
    assets_to_requirements as _ass_to_req
)

from dazzler._assets import (
    assets as _assets,
    assets_dev as _dev,
    assets_dist_path as _dist_path,
    assets_dev_path as _dev_path,
)

from ._imports_ import *  # noqa: F401, F403
from ._imports_ import __all__

_name = 'extra'
_package_name = f'dazzler_{_name}'


_components = []
for _c in __all__:
    _components.append(locals()[_c])

package = _Package(
    _package_name,
    components=_components,
    requirements=_ass_to_req(
        _dist_path, _assets.get(_name, {}),
        dev_data=_dev.get(_name, {}),
        dev_path=_dev_path,
        package_name=_package_name,
    )
)
