"""
Page link of dazzler
Created 2019-06-23
"""
from dazzler.components import core
from dazzler.system import Page

other_page = Page(
    'other',
    core.Link('https://www.google.com', 'google', identity='external'),
    url='/other',
)


page = Page(
    __name__,
    core.Container([
        core.Link(children='internal', page_name='other', identity='internal')
    ])
)
