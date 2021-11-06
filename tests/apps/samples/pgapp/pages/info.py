import json

from dazzler.system import Page, BindingContext
from dazzler.components.core import (
    Panel, Box, Text, Button, Input, Interval, Dropdown, Container, Link
)
from dazzler.components import html, auth, icons
from dazzler.presets import PresetColor


page = Page(
    __name__,
    html.Div([
        icons.IconLoader([]),
        icons.FoundIconPack(),
        Container(
            [
                icons.Icon('fi-book'),
                Text(' Dazzler PostgreSQL integrations')
            ],
            class_name='page-title'
        ),
        Box([
            Panel(
                title='Session Info',
                identity='session-info',
                title_color=PresetColor.NEUTRAL_LIGHT,
                title_background=PresetColor.PRIMARY_DARK,
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
            Panel(
                title='User Info',
                content='',
                identity='user-info',
                title_color=PresetColor.NEUTRAL_LIGHT,
                title_background=PresetColor.PRIMARY_DARK,
            )
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
    ], identity='layout'),
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


@page.bind('title@user-info', once=True)
async def on_user_info(ctx: BindingContext):
    if ctx.user:
        await ctx.set_aspect(
            'user-info',
            content=Container([
                Box([
                    Text('Username: ', font_weight='bold'),
                    Text(ctx.user.username)
                ]),
                Box([
                    Text('Roles: ', font_weight='bold'),
                    Text(json.dumps(ctx.user.roles))
                ]),
                Box([
                    Text('First name: ', font_weight='bold'),
                    Text(ctx.user.metadata['firstname'])
                ]),
                Box([
                    Text('Last name: ', font_weight='bold'),
                    Text(ctx.user.metadata.get('lastname'))
                ]),
                auth.Logout(ctx.auth.logout_url, style={'width': '100%'})
            ])
        )
    else:
        await ctx.set_aspect(
            'user-info',
            content=Container([
                Box(Link(
                    children='Login',
                    page_name=ctx.auth.login_page.name
                )),
                Box(Link(
                    children='Register',
                    page_name=ctx.auth.register_page.name,
                )),
            ])
        )
