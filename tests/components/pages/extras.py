"""
Page extras of dazzler
Created 2019-09-03

Gallery of extra components.
"""
from dazzler.components import core, extra
from dazzler.system import Page, Trigger, BindingContext

page = Page(
    __name__,
    core.Container([
        core.Button('Notify', identity='notify-btn'),
        extra.Notice('Notice', identity='notice'),
        extra.Spinner(identity='spin'),
        core.Container([
            core.Container('lorem', style={'padding': '2rem'})
            for _ in range(20)
        ]),
        extra.Sticky(
            extra.Drawer(
                core.Container('drawed'), side='bottom', identity='draw'
            ),
            identity='stick',
            bottom='0',
        ),
    ])
)


@page.bind(Trigger('notify-btn', 'clicks'))
async def on_notify(ctx: BindingContext):
    await ctx.set_aspect(
        'notice',
        body=f'Clicked {ctx.trigger.value}',
        displayed=True,
    )
