"""
Page select of dazzler
Created 2019-06-26
"""
import json

from dazzler.components import core
from dazzler.system import Page, Trigger, BindingContext

page = Page(
    __name__,
    core.Container([
        core.Select([
            {'value': x, 'label': str(x)} for x in range(1, 11)
        ], identity='select'),
        core.Select([
            {'value': x, 'label': str(x)} for x in range(1, 11)
        ], multi=True, identity='multi'),
        core.Container(identity='output'),
        core.Container(identity='multi-output'),
    ]),
)


@page.bind(Trigger('select', 'value'))
async def on_value(ctx: BindingContext):
    await ctx.set_aspect('output', children=ctx.trigger.value)


@page.bind(Trigger('multi', 'value'))
async def on_value(ctx: BindingContext):
    await ctx.set_aspect(
        'multi-output',
        children=json.dumps(ctx.trigger.value)
    )
