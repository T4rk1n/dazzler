"""
Page icons of dazzler
Created 2021-06-13
"""
from dazzler.components import core, icons
from dazzler.system import Page

page = Page(
    __name__,
    core.Container([
        icons.IconLoader([]),
        icons.LinearIconPack(),
        icons.FoundIconPack(),
        icons.OpenIconicPack(),
        icons.TypiconsPack(),
        icons.FlagIconPack(),
        core.Container(icons.Icon('lnr-home'),),
        core.Container(icons.Icon('fi-home')),
        core.Container(icons.Icon('oi-bug')),
        core.Container(icons.Icon('typcn-globe')),
        core.Container(icons.Icon('flag-icon-gr', icon_pack='flag-icon'))
    ])
)
