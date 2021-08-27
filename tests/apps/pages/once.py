from dazzler.system import Page, BindingContext
from dazzler.components.core import Box, Container, Text, Input

page = Page(
    __name__,
    Container([
        Box([
            Text(identity='binding-output'),
            Input(value='initial-binding', identity='binding-input'),
            Text(identity='always-binding'),
        ]),
        Box([
            Text(identity='tie-output'),
            Input(value='initial-tie', identity='tie-input'),
            Text(identity='always-tie'),
        ])
    ]),
)

page.tie('value@tie-input', 'text@tie-output', once=True)

# Tie the always for wait assertions.
page.tie('value@tie-input', 'text@always-tie')
page.tie('value@binding-input', 'text@always-binding')


@page.bind('value@binding-input', once=True)
async def once_binding(ctx: BindingContext):
    await ctx.set_aspect('binding-output', text=ctx.trigger.value)
