"""
Page checklist of dazzler
Created 2019-06-19
"""
import json

from dazzler.components import core
from dazzler.system import Page, Trigger, BindingContext

page = Page(
    __name__,
    core.Container([
        core.CheckList(identity='checklist', options=[
            {'label': f'option {x}', 'value': x} for x in range(1, 12)
        ]),
        core.Container(identity='output')
    ]),
)


@page.bind(Trigger('checklist', 'values'))
async def on_values(ctx: BindingContext):
    await ctx.set_aspect('output', children=json.dumps(ctx.trigger.value))
