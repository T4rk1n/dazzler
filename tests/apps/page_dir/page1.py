
from dazzler.components import core
from dazzler.system import Page

page = Page(
    __name__,
    core.Container('Page 1', identity='page_id')
)
