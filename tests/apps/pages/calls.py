from dazzler.errors import TriggerLoopError
from dazzler.system import Page, CallContext
from dazzler.components import core

page = Page(
    __name__,
    core.Container([
        core.Input(identity='simple-input'),
        core.Input(identity='circular-input'),
        core.Container([
            core.Text(identity='simple-output'),
            core.Text(identity='circular-output')
        ]),
        core.Box([
            core.Form(
                fields=[
                    {
                        'label': 'First Name',
                        'name': 'first-name',
                        'component': core.Input(identity='firstname')
                    },
                    {
                        'label': 'Last Name',
                        'name': 'last_name',
                        'component': core.Input(identity='lastname')
                    }
                ],
                include_submit=False,
                identity='form',
            ),
            core.Button('Submit', identity='submit'),
            core.Box(identity='output')
        ], column=True)
    ]),
)


@page.call('clicks@submit', 'value@firstname', 'value@lastname')
async def on_submit_call(ctx: CallContext):
    ctx.set_aspect(
        'output',
        children=core.Text(
            f'Hello {ctx.states["firstname"]["value"]}'
            f' {ctx.states["lastname"]["value"]}',
            color='green'
        )
    )


@page.call('value@simple-input')
async def on_input(ctx: CallContext):
    ctx.set_aspect('simple-output', text=ctx.trigger.value)


@page.call('value@circular-input')
async def on_circular_input(ctx: CallContext):
    try:
        ctx.set_aspect('circular-input', value='not the trigger value')
    except TriggerLoopError:
        ctx.set_aspect('circular-output', text='circular output')
