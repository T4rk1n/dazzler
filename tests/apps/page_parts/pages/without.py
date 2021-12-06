from dazzler.components import core
from dazzler.system import Page

page = Page(
    __name__,
    core.Container([
        core.Text('Without', identity='without'),
    ]),
    include_app_footer=False,
    include_app_header=False,
)
