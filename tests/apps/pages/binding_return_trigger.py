"""
Page binding_return_trigger of dazzler
Created 2019-06-17
"""

from dazzler.components import core
from dazzler.system import Page, Trigger, BindingContext

page = Page(
    __name__,
    core.Container([
        core.Container('click', identity='click'),
        core.Container(identity='output'),
        core.Container(identity='trigger-output'),
    ])
)


@page.bind(Trigger('click', 'n_clicks'))
async def on_click(ctx: BindingContext):
    await ctx.set_aspect(
        'output',
        children=core.Container([
            core.Container('from click', identity='trigger'),
            core.Input(value=ctx.trigger.value,
                       type='number', identity='store-clicks')
        ])
    )


@page.bind(Trigger('trigger', 'children'))
async def on_client(ctx: BindingContext):
    clicks = await ctx.get_aspect('store-clicks', 'value')
    await ctx.set_aspect(
        'trigger-output', children=f'{ctx.trigger.value} {clicks}'
    )
