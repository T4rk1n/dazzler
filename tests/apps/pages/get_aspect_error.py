"""
Page get_aspect_error of dazzler
Created 2019-06-15
"""
from dazzler.components import core
from dazzler.system import Page, Trigger, BindingContext
from dazzler.errors import GetAspectError

page = Page(
    __name__,
    core.Container([
        core.Button('click error', identity='click-error'),
        core.Container(identity='error-output')
    ])
)


@page.bind(Trigger('click-error', 'clicks'))
async def trigger_error(ctx: BindingContext):
    try:
        await ctx.get_aspect('invalid', 'error')
    except GetAspectError as err:
        await ctx.set_aspect('error-output', children=err.args[0])
