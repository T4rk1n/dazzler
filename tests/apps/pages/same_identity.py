"""
Page same_identity of dazzler
Created 2019-06-17
"""
from dazzler.components import core
from dazzler.system import Page, Trigger, BindingContext, State

page = Page(
    __name__,
    core.Container([
        core.Container(
            core.Input(value=0, type='number', identity='same'),
            identity='container'
        ),
        core.Container('click', identity='click')
    ])
)


@page.bind(Trigger('click', 'n_clicks'), State('container', 'children'))
async def on_click(ctx: BindingContext):
    component = ctx.states['container']['children']
    component.value = ctx.trigger.value
    await ctx.set_aspect(
        'container',
        children=component
    )
