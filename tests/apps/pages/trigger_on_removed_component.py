from dazzler.components import core
from dazzler.system import Page, Trigger, BindingContext

page = Page(
    'removed-component',
    core.Container([
        core.Container(
            core.Container(identity='set-me'), identity='remove-inner'
        ),
        core.Container('remover', identity='remover'),
        core.Container('setter', identity='setter'),
        core.Container(identity='done')
    ])
)


@page.bind(Trigger('remover', 'n_clicks'))
async def remover(context: BindingContext):
    await context.set_aspect(
        'remove-inner',
        children=f'removed {context.trigger.value}'
    )


@page.bind(Trigger('setter', 'n_clicks'))
async def on_set(context: BindingContext):
    await context.set_aspect(
        'set-me',
        children='set'
    )
    await context.set_aspect(
        'done',
        children=f'done {context.trigger.value}'
    )
