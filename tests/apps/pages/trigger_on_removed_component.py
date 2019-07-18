from dazzler.components import core
from dazzler.system import Page, Trigger, BindingContext

page = Page(
    'removed-component',
    core.Container([
        core.Container(
            core.Container(identity='set-me'), identity='remove-inner'
        ),
        core.Button('remover', identity='remover'),
        core.Button('setter', identity='setter'),
        core.Container(identity='done')
    ])
)


@page.bind(Trigger('remover', 'clicks'))
async def remover(context: BindingContext):
    await context.set_aspect(
        'remove-inner',
        children=f'removed {context.trigger.value}'
    )


@page.bind(Trigger('setter', 'clicks'))
async def on_set(context: BindingContext):
    await context.set_aspect(
        'set-me',
        children='set'
    )
    await context.set_aspect(
        'done',
        children=f'done {context.trigger.value}'
    )
