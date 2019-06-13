import functools

from dazzler.components import core
from dazzler.system import Page, Trigger, BindingContext

page = Page(
    'binding-chain',
    core.Container([
        core.Container(x, identity=f'trigger-{x}') for x in range(1, 21)
    ] + [core.Container(identity='output')])
)


async def update_next(context: BindingContext, num: int = 0):
    await context.set_aspect(
        f'trigger-{num+1}',
        n_clicks=1,
    )


@page.bind(Trigger('trigger-20', 'n_clicks'))
async def last_trigger(context: BindingContext):
    await context.set_aspect('output', children='output generated')


for i in range(1, 20):
    page.bind(Trigger(f'trigger-{i}', 'n_clicks'))(
        functools.partial(update_next, num=i)
    )
