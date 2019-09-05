import itertools

from dazzler.components import core
from dazzler.system import Page, Trigger, BindingContext

text_inputs = ('text', 'search', 'tel', 'password', 'email')

page = Page(
    'input-output',
    core.Container([
        # Textual inputs
        core.Html('form', [
            core.Container(list(itertools.chain(*(
                (
                    core.Input(type=text, identity=text, name=text),
                    core.Container(f'{text}-output', identity=f'{text}-output')
                )
                for text in text_inputs
            )))),
            core.Input(identity='number', type='number', name='num'),
            core.Input(identity='checkbox', type='checkbox'),
            core.Container(identity='number-output'),
            core.Container(identity='checkbox-output'),
            # FIXME Reset doesn't work with controlled components.
            #  Maybe add a proper Form component and reset button?
            # core.Input(type='reset'),
        ]),
    ])
)


async def on_value(ctx: BindingContext):
    await ctx.set_aspect(
        f'{ctx.trigger.identity}-output',
        children=f'{ctx.trigger.identity} value {ctx.trigger.value}'
    )


for identity in (text_inputs + ('number',)):
    page.bind(Trigger(identity, 'value'))(on_value)


@page.bind(Trigger('checkbox', 'checked'))
async def on_check(ctx: BindingContext):
    await ctx.set_aspect(
        'checkbox-output', children=f'Checked: {ctx.trigger.value}'
    )
