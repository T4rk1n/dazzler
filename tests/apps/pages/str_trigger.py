from dazzler.components import core
from dazzler.system import Page, BindingContext


page = Page(
    __name__,
    core.Container([
        core.Input(identity='input'),
        core.Button('click me', identity='btn'),
        core.Container(identity='output-state'),
        core.Container(identity='output-trigger')
    ])
)


@page.bind('clicks@btn', 'value@input')
async def on_click(ctx: BindingContext):
    await ctx.set_aspect('output-trigger', children=ctx.trigger.value)
    await ctx.set_aspect('output-state', children=ctx.states['input']['value'])
