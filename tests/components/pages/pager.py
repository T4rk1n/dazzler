"""
Page pager of dazzler
Created 2019-09-03
"""
from dazzler.components import core, extra
from dazzler.system import Page, Trigger, BindingContext, State

items = list(range(1, 200))

page = Page(
    __name__,
    core.Container([
        core.Grid([], columns=2, identity='output'),
        extra.Pager(total_items=len(items), items_per_page=10, identity='pager'),
        core.Container(identity='num_pages'),
    ])
)


@page.bind(Trigger('pager', 'current_page'))
async def on_page(ctx: BindingContext):
    start = await ctx.get_aspect('pager', 'start_offset')
    stop = await ctx.get_aspect('pager', 'end_offset')
    await ctx.set_aspect('output', children=items[start:stop])


@page.bind(Trigger('pager', 'total_pages'))
async def on_total(ctx: BindingContext):
    await ctx.set_aspect('num_pages', children=ctx.trigger.value)
