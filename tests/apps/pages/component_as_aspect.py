"""
Page component_as_aspect of dazzler
Created 2019-06-17
"""
from dazzler.components import core
from dazzler.system import Page, Trigger, BindingContext, State

from tests.components import spec_components as spec

arr = list(range(1, 12))

page = Page(
    __name__,
    core.Container([
        spec.ComponentAsAspect(
            identity='component',
            single=core.Button('single', identity='single'),
            array=[
                core.Input(value=x, identity=f'array-{x}', type='number')
                for x in arr
            ],
            shape={'shaped': core.Button('shaped', identity='shaped')},
            list_of_dict=[
                {
                    'label': core.Container(f'label{x}', identity=f'label-{x}'),
                    'value': f'label-{x}'
                } for x in arr
            ]
        ),
        core.Container(identity='single-output'),
        core.Container([
            core.Container(identity=f'output-array-{x}') for x in arr
        ]),
        core.Button('click sum', identity='click-sum'),
        core.Container(identity='sum-output'),
        core.Container(identity='shaped-output'),
    ])
)


async def bind_click(ctx: BindingContext):
    await ctx.set_aspect(
        f'{ctx.trigger.identity}-output',
        children=f'Click {ctx.trigger.identity}: {ctx.trigger.value}'
    )


page.bind(Trigger('single', 'clicks'))(bind_click)
page.bind(Trigger('shaped', 'clicks'))(bind_click)


async def bind_array_value(ctx: BindingContext):
    await ctx.set_aspect(
        f'output-{ctx.trigger.identity}',
        children=f'{ctx.trigger.identity} value: {ctx.trigger.value}'
    )


for i in arr:
    page.bind(Trigger(f'array-{i}', 'value'))(bind_array_value)


@page.bind(
    Trigger('click-sum', 'clicks'),
    *[State(f'array-{x}', 'value') for x in range(1, 10)]
)
async def bind_array_state_sum(ctx: BindingContext):
    await ctx.set_aspect(
        'sum-output',
        children=f'Sum {sum(state["value"] for state in ctx.states.values())}'
    )
