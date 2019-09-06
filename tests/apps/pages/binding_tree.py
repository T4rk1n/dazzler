import asyncio
import json
from dazzler.components import core
from dazzler.system import Page, Trigger, BindingContext, State

page = Page(
    'binding-tree',
    core.Container([
        core.Button('trigger', identity='trigger'),
        core.Container([
            core.Container([
                core.Input(identity=f'output-{i}', type='number')
                for i in range(1, 3)
            ]),
            core.Container([
                core.Input(identity=f'value-{i}', type='number')
                for i in range(1, 11)
            ]),
            core.Container('[]', identity='output'),
            core.Container(identity='done')
        ])
    ])
)


@page.bind(Trigger('trigger', 'clicks'))
async def trigger_click(context: BindingContext):
    await context.set_aspect(
        'output-1',
        value=1
    )
    # Got to alternate the inputs for the first set to complete and let
    # frontend to register the state and all,
    # so as long as this start after and the other delay
    # is a little higher it should be ok.
    # otherwise the test is flaky because the state won't have updated before
    # the trigger and there be missing numbers.
    await asyncio.sleep(0.1)
    await context.set_aspect(
        'output-2',
        value=2
    )


async def trigger_input(context: BindingContext):
    num = context.trigger.value
    if num == 1:
        start = 1
        stop = 6
    else:
        start = 6
        stop = 11

    for value in range(start, stop):
        await context.set_aspect(
            f'value-{value}',
            value=value
        )
        await asyncio.sleep(0.15)


async def trigger_output(context: BindingContext):
    value = context.trigger.value
    current = json.loads(context.states['output']['children'])
    current.append(value)
    await context.set_aspect(
        'output',
        children=json.dumps(current),
    )
    if value == 10:
        await context.set_aspect(
            'done',
            children='done'
        )

for i in range(1, 3):
    page.bind(Trigger(f'output-{i}', 'value'))(trigger_input)


for i in range(1, 11):
    page.bind(
        Trigger(f'value-{i}', 'value'),
        State('output', 'children')
    )(trigger_output)


if __name__ == '__main__':
    from dazzler import Dazzler

    app = Dazzler(__name__)
    app.add_page(page)
    app.start()
