"""
Page html of dazzler
Created 2019-06-13
"""
import json
import functools

from dazzler.components import core
from dazzler.system import Page, Trigger, BindingContext

page = Page(
    __name__,
    core.Container([
        core.Html('button', 'click me', events=['click'], identity='click'),
        core.Html('input', events=['focus', 'blur'], identity='focus'),
        core.Html('div', 'mouse',
                  events=[
                      'mouseup',
                      'mouseenter',
                      'mouseleave',
                      'mousedown',
                      'mouseover'
                  ], identity='mouse'),

        core.Container(identity='click-output'),
        core.Container(identity='focus-output'),
        core.Container(identity='mouse-output'),
    ])
)


async def on_event(ctx: BindingContext, output=''):
    await ctx.set_aspect(
        output, children=json.dumps(ctx.trigger.value)
    )

for identity in ('click', 'focus', 'mouse'):
    page.bind(Trigger(identity, 'event'))(
        functools.partial(on_event, output=f'{identity}-output')
    )
