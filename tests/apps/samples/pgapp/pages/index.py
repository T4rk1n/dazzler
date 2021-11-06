from dazzler.components import core, icons
from dazzler.components.extra import PageMap
from dazzler.system import Page

page = Page(__name__, core.Container([
    icons.IconLoader(),
    icons.FoundIconPack(),
    core.Container(
        [
            icons.Icon('fi-web'),
            core.Text(' Dazzler PostgreSQL')
        ],
        class_name='page-title'
    ),
    PageMap()
]), url='/')
