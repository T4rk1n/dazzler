"""
Page datalist of dazzler
Created 2019-06-13
"""
from dazzler.components import core
from dazzler.system import Page, Trigger, BindingContext

page = Page(
    'datalist',
    core.Container([
        core.DataList([
            {'value': 'foo', 'label': 'Foo'},
            {'value': 'bar', 'label': 'Bar'}
        ], identity='datalist'),
        core.Container(identity='output')
    ]),
)


@page.bind(Trigger('datalist', 'data_value'))
async def on_list(ctx: BindingContext):
    await ctx.set_aspect('output', children=ctx.trigger.value)
