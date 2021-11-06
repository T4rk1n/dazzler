from dazzler.components import core
from dazzler.system import Page, Trigger, BindingContext

page = Page(
    __name__,
    core.Container([
        core.Button('clicker', identity='clicker'),
        core.Input(value='initial', identity='input'),
        core.Container('output', identity='output'),
        core.Container('clicks', identity='click-output')
    ])
)

page.tie(
    Trigger(aspect='clicks', identity='clicker', skip_initial=True),
    'children@click-output'
)


@page.bind(
    Trigger(
        aspect='value',
        identity='input',
        skip_initial=True,
    )
)
async def on_input(ctx: BindingContext):
    await ctx.set_aspect('output', children=ctx.trigger.value)
