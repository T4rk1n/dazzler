"""
Page radio of dazzler
Created 2019-06-20
"""
from dazzler.components import core
from dazzler.system import Page, Trigger, BindingContext, State

radio = core.RadioList(identity='radio', options=[
    {'label': f'option {x}', 'value': x} for x in range(1, 12)
])

page = Page(
    __name__,
    core.Container([
        radio,
        core.Container(identity='output'),
    ])
)


@page.bind(Trigger('radio', 'value'))
async def on_radio(ctx: BindingContext):
    await ctx.set_aspect('output', children=f'Selected: {ctx.trigger.value}')

