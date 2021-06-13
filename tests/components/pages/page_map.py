"""
Page page_map of dazzler
Created 2021-06-13
"""
from dazzler.components import core, extra
from dazzler.system import Page

page = Page(
    __name__,
    core.Container([
        core.Html('h1', 'Dazzler Playground'),
        extra.PageMap(),
    ]),
    url='/'
)
