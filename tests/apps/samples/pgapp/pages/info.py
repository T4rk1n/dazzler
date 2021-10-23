import json

from dazzler.system import Page, BindingContext
from dazzler.components.core import (
    Panel, Box, Text, Button, Input, Interval, Dropdown
)
from dazzler.components import html

page = Page(
    __name__,
    html.Div([
        html.H1('Dazzler PostgreSQL integrations'),
        Box([
            Panel(
                title='Session Info',
                content=html.Div([
                    Box([
                        Text(
                            'Session ID: ',
                            font_weight='bold',
                            identity='starter'
                        ),
                        Text(identity='session-id'),
                    ]),
                    Box([
                        Text('Clicks: ', font_weight='bold'),
                        Text(identity='session-clicks')
                    ]),
                    Box([
                        Text('Text: ', font_weight='bold'),
                        Text(identity='session-text')
                    ]),
                    Box([
                        Text('List: ', font_weight='bold'),
                        Text(identity='session-list')
                    ]),
                    Box([
                        Text('Object: ', font_weight='bold'),
                        Text(identity='session-object')
                    ])
                ]),
            ),
        ]),
        Box([
            Button('Save clicks', identity='save-clicks'),
            Button('Delete clicks', identity='delete-clicks'),
            Input(identity='session-input'),
            Dropdown(
                options=['one', 'two', 'three'],
                identity='list-dropdown',
                multi=True,
                style={'width': '200px'},
            ),
            Dropdown(
                options=[
                    {'label': 'foo', 'value': {'foo': 'bar'}},
                    {'label': 'hello', 'value': {'hello': 'world'}}
                ],
                identity='object-dropdown',
                style={'width': '200px'}
            )
        ]),
        Interval(identity='session-watch')
    ]),
)


@page.bind('text@starter', once=True)
async def on_start(ctx: BindingContext):
    await ctx.set_aspect(
        'session-id',
        text=ctx.session.session_id
    )


@page.bind('clicks@save-clicks')
async def on_click(ctx: BindingContext):
    session_clicks = await ctx.session.get('clicks') or 0
    await ctx.session.set('clicks', session_clicks + 1)


@page.bind('clicks@delete-clicks')
async def on_delete(ctx: BindingContext):
    await ctx.session.delete('clicks')


@page.bind('value@session-input')
async def session_input(ctx: BindingContext):
    await ctx.session.set('text', ctx.trigger.value)


@page.bind('value@list-dropdown')
async def session_list(ctx: BindingContext):
    await ctx.session.set('list', ctx.trigger.value)


@page.bind('value@object-dropdown')
async def session_object(ctx: BindingContext):
    await ctx.session.set('object', ctx.trigger.value)


@page.bind('times@session-watch')
async def session_watch(ctx: BindingContext):
    clicks = await ctx.session.get('clicks')
    await ctx.set_aspect(
        'session-clicks',
        text=clicks
    )
    text = await ctx.session.get('text')
    await ctx.set_aspect(
        'session-text',
        text=text
    )
    list_value = await ctx.session.get('list')
    await ctx.set_aspect(
        'session-list',
        text=json.dumps(list_value) if list_value else '[]'
    )
    obj_value = await ctx.session.get('object')
    await ctx.set_aspect(
        'session-object',
        text=json.dumps(obj_value) if obj_value else '{}'
    )
