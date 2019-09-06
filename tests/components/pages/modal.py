"""
Page modal of dazzler
Created 2019-07-07
"""
from dazzler.components import core
from dazzler.system import Page, Trigger, BindingContext

page = Page(
    __name__,
    core.Container([
        core.Modal(
            core.Container('modal body', identity='modal-body'),
            header='modal header',
            footer='modal footer',
            identity='modal',
            close_button=False,
        ),
        core.Button('Show modal', identity='show')
    ])
)


@page.bind(Trigger('show', 'clicks'))
async def on_show(ctx: BindingContext):
    await ctx.set_aspect('modal', active=True)
