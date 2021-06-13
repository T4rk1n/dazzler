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
        core.Button('Toaster', identity='toaster-btn'),
        extra.Notice('Notice', identity='notice'),
        extra.Spinner(identity='spin'),
        extra.PopUp(
            core.Container('Click on me to open a pop up.'),
            core.Container('Content'),
        ),
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
        core.ListBox(identity='toast-output'),
    ])
)


@page.bind(Trigger('notify-btn', 'clicks'))
async def on_notify(ctx: BindingContext):
    await ctx.set_aspect(
        'notice',
        body=f'Clicked {ctx.trigger.value}',
        displayed=True,
    )


@page.bind('clicks@toaster-btn')
async def on_toast(ctx: BindingContext):
    await ctx.set_aspect('toast-output', append=extra.Toast('Toast it up!'))
