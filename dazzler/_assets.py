import os
import json

from .tools import get_package_path

root_path = get_package_path('dazzler')
assets_path = os.path.abspath(os.path.join(root_path, 'assets'))
assets_dist_path = os.path.join(assets_path, 'dist')
assets_dev_path = os.path.join(assets_path, 'dev')
vendors_path = os.path.join(assets_path, 'vendors')
meta_path = os.path.join(assets_path, 'meta.js')

_asset_json = os.path.join(assets_dist_path, 'assets.json')
_asset_json_dev = os.path.join(assets_dev_path, 'assets.json')

if os.path.exists(_asset_json):
    with open(_asset_json) as _file:
        assets = json.load(_file)['chunks']
else:
    assets = {}

if os.path.exists(_asset_json_dev):
    with open(_asset_json_dev) as _file:
        assets_dev = json.load(_file)['chunks']
else:
    assets_dev = {}
