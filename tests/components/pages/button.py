"""
Page button of dazzler
Created 2019-07-06
"""
from dazzler.components import core
from dazzler.system import Page, Trigger, BindingContext

page = Page(
    __name__,
    core.Container([
        core.Button('Click me', identity='button', rounded=True),
        core.Container(identity='output')
    ])
)


@page.bind(Trigger('button', 'clicks'))
async def on_click(ctx: BindingContext):
    await ctx.set_aspect('output', children=f'clicked: {ctx.trigger.value}')
