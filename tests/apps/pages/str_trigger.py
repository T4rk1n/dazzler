from dazzler.components import core
from dazzler.system import Page, BindingContext


page = Page(
    __name__,
    core.Container([
        core.Input(identity='input'),
        core.Button('click me', identity='btn1'),
        core.Button('click me 2', identity='btn2'),
        core.Container(identity='output-state'),
        core.Container(identity='output-trigger')
    ])
)


@page.bind(['clicks@btn1', 'clicks@btn2'], 'value@input')
async def on_click(ctx: BindingContext):
    await ctx.set_aspect('output-trigger', children=ctx.trigger.identity)
    await ctx.set_aspect('output-state', children=ctx.states['input']['value'])
