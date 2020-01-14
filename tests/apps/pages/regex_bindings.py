"""
Page regex_bindings of dazzler
Created 2020-01-12
"""
import re

from dazzler.components import core
from dazzler.system import Page, Trigger, BindingContext

page = Page(
    __name__,
    core.Container([
        core.Button('btn1', identity='btn1'),
        core.Button('btn2', identity='btn2'),
        core.Container(identity='output1'),
        core.Container(identity='output2'),
    ])
)


@page.bind(Trigger(r'btn\d', 'clicks', regex=True))
async def on_any_click(ctx: BindingContext):
    await ctx.set_aspect(
        re.compile(r'output\d'),
        children=f'clicked from button {ctx.trigger.identity}'
    )
