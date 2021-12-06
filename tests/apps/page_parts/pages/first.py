from dazzler.components import core
from dazzler.system import Page, BindingContext

page = Page(__name__, core.Container([
    core.Text('first', identity='first'),
    core.Button('first-binding', identity='bind-first-clicker'),
    core.Text(identity='bind-first-output'),
    core.Button('first-tie', identity='tie-first-clicker'),
    core.Text(identity='tie-first-output'),
]))

page.tie('clicks@first-tie', 'text@first-tie-output')


@page.bind('clicks@bind-first-clicker')
async def on_first(ctx: BindingContext):
    await ctx.set_aspect('bind-first-output', text=ctx.trigger.value)
