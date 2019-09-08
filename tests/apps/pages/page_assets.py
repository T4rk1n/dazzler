"""
Page page_assets of dazzler
Created 2019-06-15
"""
import os

from dazzler.components import core
from dazzler.system import Page, Requirement


page = Page(
    __name__,
    core.Container([
        core.Container('loaded', class_name='loaded'),
    ]),
    requirements=[
        Requirement(
            os.path.join(os.path.dirname(__file__), 'withRequirements.js'),
            page='page_assets'
        )
    ],
    requirements_dir='assets'
)
