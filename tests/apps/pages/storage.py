"""
Page storage of dazzler
Created 2019-07-17
"""
import json

from dazzler.components import core
from dazzler.system import Page, Trigger, BindingContext

page = Page(
    __name__,
    core.Container([
        core.Button('Set local', identity='local-btn'),
        core.Container(identity='local-output'),
        core.Button('Set session', identity='session-btn'),
        core.Container(identity='session-output')
    ])
)


@page.bind(Trigger('local-btn', 'clicks'))
async def on_click_local(ctx: BindingContext):
    data = await ctx.get_local_storage('data')
    if not data:
        data = {'clicks': 0}
    data['clicks'] += 1
    await ctx.set_local_storage('data', data)
    await ctx.set_aspect('local-output', children=json.dumps(data))


@page.bind(Trigger('session-btn', 'clicks'))
async def on_clicks_session(ctx: BindingContext):
    data = await ctx.get_session_storage('data')
    if not data:
        data = {'clicks': 0}
    data['clicks'] += 1
    await ctx.set_session_storage('data', data)
    await ctx.set_aspect('session-output', children=json.dumps(data))
