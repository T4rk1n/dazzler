"""
Page table of dazzler
Created 2019-07-07
"""
from dazzler.components import core
from dazzler.system import Page

page = Page(
    __name__,
    core.Container([
        core.Table(
            [[1, 2, 3], [4, 5, 6], [3, 4, 5]],
            headers=['one', 'two', 'three'],
            caption='Table',
            include_row_number=True,
            row_number_start=7,
            centered=True,
            bordered=True,
            size='large'
        ),
    ], class_name='row center')
)
