"""
Page slider of dazzler
Created 2019-07-06
"""
from dazzler.components import core
from dazzler.system import Page, Trigger, BindingContext

page = Page(
    __name__,
    core.Container([
        core.Container(style={'marginTop': '20px'}),
        core.Container(
            [
                core.Container('start', identity='start'),
                core.Slider(
                    -100, 100,
                    identity='slider',
                    value=-20,
                    style={'width': '80%'}
                ),
                core.Container('stop', identity='stop')],
            style={'padding': '3rem'},
            class_name='row'
        ),

        core.Container(identity='output')
    ], style={'width': '100%'},)
)


@page.bind(Trigger('slider', 'value'))
async def on_value(ctx: BindingContext):
    await ctx.set_aspect(
        'output', children=f'{ctx.trigger.identity}: {ctx.trigger.value}'
    )
