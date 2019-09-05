"""
Page grid of dazzler
Created 2019-07-08
"""
from dazzler.components import core
from dazzler.system import Page, Trigger, BindingContext, State

page = Page(
    __name__,
    core.Container([
        core.Grid([x for x in range(1, 101)], 10, identity='grid')
    ])
)
