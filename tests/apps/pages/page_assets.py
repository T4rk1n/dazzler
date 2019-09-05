"""
Page page_assets of dazzler
Created 2019-06-15
"""
import os

from dazzler.components import core
from dazzler.system import Page, Requirement

# noinspection PyProtectedMember
from dazzler._assets import assets_path


page = Page(
    __name__,
    core.Container([
        core.Container('loaded', class_name='loaded'),
    ]),
    requirements=[
        Requirement(
            os.path.join(assets_path, 'vendors', 'lodash.min.js'),
            page='page_assets'
        )
    ],
    requirements_dir='assets'
)
