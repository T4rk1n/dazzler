from dazzler.components import core
from dazzler.system import Page, Trigger, BindingContext
from dazzler import errors

page = Page(
    name='set-aspect-trigger-error',
    layout=core.Container([
        core.Button('error', identity='click-error', id='click-error'),
        core.Container(identity='error-output', id='error-output')
    ]),
)


@page.bind(Trigger('click-error', 'clicks'))
async def on_click_error(context: BindingContext):
    try:
        await context.set_aspect('click-error', clicks=2)
    except errors.TriggerLoopError as error:
        await context.set_aspect('error-output', children=f'{error.args[0]}')
