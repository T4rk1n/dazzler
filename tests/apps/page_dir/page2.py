from dazzler.components import core
from dazzler.system import Page

page = Page(
    __name__,
    core.Container('Page 2', identity='page_id')
)
