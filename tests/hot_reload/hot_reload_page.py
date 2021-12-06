from dazzler.components import core
from dazzler.system import Page

page = Page(
    __name__,
    core.Container('Initial', identity='content'),
    url='/',
    html_header='<div id="injected">Static</div>'
)
