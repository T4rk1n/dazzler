"""
Page interval of dazzler
Created 2019-06-13
"""
from dazzler.components import core
from dazzler.system import Page, Trigger, BindingContext, State

page = Page(
    __name__,
    core.Container([
        core.Interval(timeout=250, identity='interval'),
        core.Container(identity='output'),
        core.Input(type='checkbox', identity='toggle'),
    ])
)


@page.bind(Trigger('interval', 'times'), State('toggle', 'checked'))
async def on_time(ctx: BindingContext):
    await ctx.set_aspect('output', children=f'Times: {ctx.trigger.value}')
    if ctx.trigger.value > 5 and not ctx.states['toggle']['checked']:
        await ctx.set_aspect('interval', active=False)


@page.bind(Trigger('toggle', 'checked'))
async def on_check(ctx: BindingContext):
    await ctx.set_aspect('interval', active=ctx.trigger.value)
