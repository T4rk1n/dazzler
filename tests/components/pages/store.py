"""
Page store of dazzler
Created 2019-06-21
"""
import json
import itertools

from dazzler.components import core
from dazzler.system import Page, Trigger, BindingContext, State


store_types = list(itertools.chain(*itertools.combinations(((x, y[i])
                                                            for x, y in [
    (
        ('int', int, str), [1, 44, 555, 789776]
    ),
    (
        ('float', float, str),
        [1.2, 3.4, 9999.11, 6.222]
    ),
    (
        ('string', str, str),
        ['foo', 'bar', 'dazzler', 'store']
    ),
    (
        ('dict', json.dumps, json.dumps),
        [
            {'obj': 'o'},
            {'foo': {'bar': 'one', 'arr': [1, 2, 3]}},
            {'arr': [1, 2.551, 3]},
            {'arr': [2, 3, 4]}
        ]
    ),
    (
        ('array', json.dumps, json.dumps),
        [
            [1, 2, 3, 4],
            [1, 'foo', 'bar', 4],
            [{'arr': [1, 2, 3], 'foo': 'bar'}],
            [[1, 2, 4],  ['foo', 'bar']]
        ]
    )
] for i in range(0, 4)), 2)))

page = Page(
    __name__,
    core.Container([
        core.Store(identity='empty-store'),
        core.Store(data={'foo': 'bar'}, identity='initial-store'),
        core.Button('click', identity='click'),
        core.Container(identity='click-output'),
        core.Container(identity='initial-output'),
        core.Button('type-click', identity='type-click'),
        core.Store(identity='type-store'),
        core.Container(identity='type-output'),
        core.Button('get-aspect', identity='get-aspect-click'),
        core.Container(identity='get-aspect-output')
    ])
)


@page.bind(Trigger('initial-store', 'data'))
async def initial(ctx: BindingContext):
    await ctx.set_aspect(
        'initial-output',
        children=json.dumps(ctx.trigger.value)
    )


@page.bind(Trigger('click', 'clicks'), State('empty-store', 'data'))
async def click_store(ctx: BindingContext):
    data = ctx.states['empty-store']['data'] or {'clicks': 0}

    data['clicks'] += 1

    await ctx.set_aspect('empty-store', data=data)


@page.bind(Trigger('empty-store', 'data'))
async def click_output(ctx: BindingContext):
    await ctx.set_aspect(
        'click-output',
        children=json.dumps(ctx.trigger.value)
    )


@page.bind(Trigger('type-click', 'clicks'))
async def click_type(ctx: BindingContext):
    data = store_types[ctx.trigger.value - 1][1]
    await ctx.set_aspect('type-store', data=data)


@page.bind(Trigger('type-store', 'data'), State('type-click', 'clicks'))
async def on_type(ctx: BindingContext):
    dumper = store_types[ctx.states['type-click']['clicks'] - 1][0][1]
    await ctx.set_aspect('type-output', children=dumper(ctx.trigger.value))


@page.bind(Trigger('get-aspect-click', 'clicks'))
async def click_get_aspect(ctx: BindingContext):
    value = await ctx.get_aspect('initial-store', 'data')
    await ctx.set_aspect('get-aspect-output', children=json.dumps(value))
