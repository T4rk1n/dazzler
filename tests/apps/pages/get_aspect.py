"""
Page get_aspect of dazzler
Created 2019-06-15
"""
import asyncio
import json

from dazzler.components import core
from dazzler.system import Page, Trigger, BindingContext

page = Page(
    'get-aspect',
    core.Container([
        core.Input(value=0, type='number', identity='input'),
        core.Container('Start', identity='starter'),
        core.Container('Updater', identity='updater'),
        core.Container(identity='done'),
        core.Container(identity='done-output')
    ])
)


@page.bind(Trigger('starter', 'n_clicks'))
async def starter(ctx: BindingContext):
    value = 0
    values = set()
    while value < 100:
        value = await ctx.get_aspect('input', 'value')
        values.add(value)
        await asyncio.sleep(0.05)

    await ctx.set_aspect(
        'done',
        children='done',
    )
    await ctx.set_aspect(
        'done-output',
        children=json.dumps(list(values))
    )


@page.bind(Trigger('updater', 'n_clicks'))
async def updater(ctx: BindingContext):
    value = 0
    while value < 100:
        value += 1
        await ctx.set_aspect(
            'input',
            value=value
        )
        await asyncio.sleep(0.15)
