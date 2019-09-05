import os
import json

from .tools import get_package_path

root_path = get_package_path('dazzler')
assets_path = os.path.abspath(os.path.join(root_path, 'assets'))
assets_dist_path = os.path.join(assets_path, 'dist')
assets_dev_path = os.path.join(assets_path, 'dev')
vendors_path = os.path.join(assets_path, 'vendors')


with open(os.path.join(assets_dist_path, 'assets.json')) as _file:
    assets = json.load(_file)['chunks']

with open(os.path.join(assets_dev_path, 'assets.json')) as _file:
    assets_dev = json.load(_file)['chunks']
