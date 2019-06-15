"""
Page initial_trigger of dazzler
Created 2019-06-15
"""
from dazzler.components import core
from dazzler.system import Page, Trigger, BindingContext, State

page = Page(
    'initial-trigger',
    core.Container([
        core.Input(value=10, identity='input'),
        core.Container(identity='output'),
        core.Input(value=88, identity='state'),
        core.Container(identity='state-output')
    ])
)


@page.bind(Trigger('input', 'value'), State('state', 'value'))
async def on_value(context: BindingContext):
    await context.set_aspect(
        'output',
        children=f'Input {context.trigger.value}'
    )
    await context.set_aspect(
        'state-output',
        children=F'State {context.states["state"]["value"]}'
    )
