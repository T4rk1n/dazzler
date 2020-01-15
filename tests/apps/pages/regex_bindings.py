"""
Page regex_bindings of dazzler
Created 2020-01-12
"""
import re

from dazzler.components import core
from dazzler.system import Page, Trigger, BindingContext, State

page = Page(
    __name__,
    core.Container([
        core.Button('btn1', identity='btn1'),
        core.Button('btn2', identity='btn2'),
        core.Container(identity='output1'),
        core.Container(identity='output2'),
        core.Input(identity='state1'),
        core.Store(data='store', identity='state2'),
        core.Container(identity='state-output')
    ])
)


@page.bind(
    Trigger(r'btn\d', 'clicks', regex=True),
    State(r'state\d', '(value|data)', regex=True)
)
async def on_any_click(ctx: BindingContext):
    await ctx.set_aspect(
        re.compile(r'output\d'),
        children=f'clicked from button {ctx.trigger.identity}'
    )
    output = []
    for identity, aspects in ctx.states.items():

        for aspect_name, aspect_value in aspects.items():
            output.append(
                core.Container(
                    f'{aspect_name}@{identity}: {aspect_value}',
                    identity=f'{aspect_name}-{identity}-output')
            )

    # FIXME Setting the array directly on children trigger
    #  the same identity bug #53
    await ctx.set_aspect('state-output', children=core.Container(output))
