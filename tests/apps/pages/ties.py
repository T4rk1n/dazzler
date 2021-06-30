from dazzler.components import core
from dazzler.system import Page, BindingContext

page = Page(
    __name__,
    core.Container([
        core.Input(identity='input'),
        core.Container(identity='output'),
        core.Input(identity='multi'),
        core.Container(identity='output-1'),
        core.Container(identity='output-2'),
        core.Container(identity='chain'),
        core.Container(identity='binding-output')
    ]),
    packages=['dazzler_core']
)

page.tie('value@input', 'children@output')
page.tie('value@multi', 'children@output-1', 'children@output-2')
page.tie('children@output', 'children@chain')


@page.bind('children@output')
async def on_output(ctx: BindingContext):
    await ctx.set_aspect('binding-output', children=ctx.trigger.value)

