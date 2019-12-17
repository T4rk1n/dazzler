import os

from dazzler.system import (
    Package as _Package,
    assets_to_requirements as _ass_to_req,
    Requirement as _Requirement
)

from dazzler._assets import (
    assets as _assets,
    assets_dev as _dev,
    assets_dist_path as _dist_path,
    assets_dev_path as _dev_path,
    vendors_path as _vendors
)


_name = 'renderer'
_package_name = f'dazzler_{_name}'

_vendors_requirements = [
    # React
    _Requirement(
        internal=os.path.join(_vendors, 'react-16-12-0.production.min.js'),
        dev=os.path.join(_vendors, 'react-16-12-0.development.js'),
        external='https://unpkg.com/react@16.12.0/umd/react.production.min.js',
    ),
    # React-dom
    _Requirement(
        internal=os.path.join(_vendors, 'react-dom-16-12-0.production.min.js'),
        dev=os.path.join(_vendors, 'react-dom-16-12-0.development.js'),
        external='https://unpkg.com/react-dom@16.12.0/umd/react-dom.production.min.js',  # noqa: E501
    ),
    # Normalize
    _Requirement(
        internal=os.path.join(_vendors, 'normalize-8-0-1.min.css'),
        external='https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css'  # noqa: E501
    )
]


package = _Package(
    _package_name,
    requirements=_vendors_requirements + _ass_to_req(
        _dist_path, _assets.get('commons', {}),
        dev_data=_dev.get('commons', {}),
        dev_path=_dev_path,
        package_name=_package_name
    ) + _ass_to_req(
        _dist_path, _assets.get(_name, {}),
        dev_data=_dev.get(_name, {}),
        dev_path=_dev_path,
        package_name=_package_name,
    )
)
