"""
Page progress of dazzler
Created 2019-06-26
"""
from dazzler.components import core
from dazzler.system import Page, Trigger, BindingContext, State

page = Page(
    __name__,
    core.Container([
        core.ProgressBar(
            identity='progress',
            minimum=0, high=80, low=20, maximum=100,
            rounded=True, optimum=21, striped=True, progress_text='percent'
        ),
        core.Button('add progress', identity='progress-btn'),
        core.Container(identity='counter')
    ])
)


@page.bind(Trigger('progress-btn', 'clicks'), State('progress', 'value'))
async def on_meter(ctx: BindingContext):
    new_value = (ctx.states['progress']['value'] or 0) + 1
    await ctx.set_aspect(
        'progress', value=new_value
    )
    await ctx.set_aspect('counter', children=new_value)
