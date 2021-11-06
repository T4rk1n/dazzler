"""
Base Dazzler user administration page.

Implementations:

- :py:class:`~.dazzler.contrib.PostgresUserAdminPage`
"""
import traceback
import typing

import precept.events
from aiohttp import web

from dazzler.events import DAZZLER_SETUP
from dazzler.presets import PresetColor, PresetSize
from dazzler.system import Page, CallContext, Trigger, Target, transforms as t


def _get_trigger_meta(identity: str):
    return identity.split('$')[-1]


class AdminUser(typing.NamedTuple):
    username: str
    active: bool
    roles: typing.List[str]


class AdminRole(typing.NamedTuple):
    role_name: str
    description: typing.Optional[str]


async def _confirm_delete_user(ctx: CallContext):
    username = _get_trigger_meta(ctx.trigger.identity)
    ctx.set_aspect('delete-username', text=username)
    ctx.set_aspect('confirm-delete-user-modal', active=True)


class UserAdminPage(Page):
    """
    :type app: dazzler.Dazzler
    """
    def __init__(
        self,
        app,
        name='user-admin',
        layout=None,
        authorizations=('admin',),
        users_per_page=10,
        users_page_displayed=5,
        packages=None,
        url='/auth/admin',
        **kwargs
    ):
        packages = packages or [
            'dazzler_core', 'dazzler_extra', 'dazzler_icons'
        ]
        super().__init__(
            name, layout,
            require_login=True,
            authorizations=authorizations,
            packages=packages,
            url=url,
            **kwargs
        )
        self.app = app
        self.users_per_page = users_per_page
        self.users_page_displayed = users_page_displayed
        # Import here so it's not on all pages if not required.
        from dazzler.components import core, extra, icons
        self._core = core
        self._extra = extra
        self._icons = icons

        # Ties & Transforms

        # Enabled create role button
        self.tie('value@new-role-name', 'disabled@new-role-button').transform(
            t.Length().t(t.Lesser(1))
        )

        # Updates options on role creation/deletion
        self.tie(
            Trigger(aspect='data', identity='roles-data', skip_initial=True),
            Target(aspect='options', identity=r'user-roles\$', regex=True),
        )

        # Open the user filters options
        self.tie(
            'clicks@user-filter-toggle',
            'hidden@user-filters',
        ).transform(t.Modulus(2)).t(t.Equals(0))

        # Set the user filters data.
        self.tie(
            'clicks@apply-user-filters-btn',
            'data@user-filters-data'
        ).transform(
            t.AspectValue('data@user-filters-data')
            .t(t.Set('username', t.Target('value@username-filter')))
            .t(t.Set('user_roles', t.Target('value@user-roles-filter')))
            .t(t.Set('active', t.Target('checked@user-active-filter')))
        )

        # Bindings
        self.call(
            Trigger(
                aspect='checked',
                identity=r'active\$',
                regex=True,
                skip_initial=True,
            )
        )(self.on_toggle_user_active)
        self.call(
            Trigger(
                aspect='value',
                identity=r'user-roles\$',
                regex=True,
                skip_initial=True
            )
        )(self.on_change_user_roles)
        self.call(
            Trigger(
                aspect='clicks',
                identity=r'delete\$',
                regex=True
            )
        )(_confirm_delete_user)
        self.call(
            'clicks@confirm-delete-user-button',
            'text@delete-username'
        )(self.on_delete_user)

        self.call(
            'clicks@new-role-button',
            'value@new-role-name',
            'value@new-role-description',
            'data@roles-data'
        )(self.on_create_role)

        self.call(
            Trigger(
                aspect='clicks',
                identity=r'remove-role\$',
                regex=True,
                skip_initial=True,
            ),
            'data@role-delete-offset',
            'data@roles-data',
        )(self.on_role_delete)

        self.call(
            Trigger(
                aspect='start_offset',
                identity='users-pager',
                skip_initial=True,
            ),
            'items_per_page@users-pager',
            'data@roles-data',
            'data@user-filters-data',
        )(self.on_change_users_page)

        self.call(
            Trigger(
                aspect='data',
                identity='user-filters-data',
                skip_initial=True,
            ),
            'items_per_page@users-pager',
            'data@roles-data',
        )(self.on_apply_user_filters)

        self.call(
            Trigger(
                aspect='value',
                identity=r'role-description\$',
                regex=True,
                skip_initial=True,
            )
        )(self.on_description_change)

        self.layout = self._layout_handler
        app.events.subscribe(DAZZLER_SETUP, self.setup)

    async def setup(self, event: precept.events.Event):
        pass

    # pylint: disable=unused-argument
    async def _layout_handler(self, request: web.Request):
        users = await self.get_users(0, self.users_per_page)
        roles = await self.get_roles()
        user_count = await self.get_user_count()

        return await self.get_layout(users, user_count, roles)

    async def get_layout(
        self,
        users: typing.List[AdminUser],
        user_count: int,
        roles: typing.List[AdminRole],
    ):
        core = self._core
        extra = self._extra
        icons = self._icons

        role_names = [role.role_name for role in roles]

        return core.Box([
            icons.IconLoader([]),
            icons.FoundIconPack(),
            core.Store(data=role_names, identity='roles-data'),
            core.Store(data={}, identity='user-filters-data'),
            core.Modal(
                core.Container([
                    core.Box([
                        core.Text('Are you sure you want to delete '),
                        core.Text(
                            identity='delete-username',
                            font_weight='bold',
                            preset_color=PresetColor.DANGER_DARK
                        ),
                        core.Text(' ?')
                    ], padding='1rem 0'),
                    core.Box(core.Text('Username will be up for grabs!'))
                ]),
                header=core.Box([
                    icons.Icon('fi-skull'),
                    core.Text(' Confirm user deletion')
                ], preset_size=PresetSize.LARGE, padding='1rem 0'),
                footer=core.Box(
                    core.Button(
                        [icons.Icon('fi-trash'), core.Text(' Confirm')],
                        preset=PresetColor.DANGER,
                        rounded=True,
                        size=PresetSize.LARGER,
                        bordered=False,
                        identity='confirm-delete-user-button'
                    ),
                    justify='flex-end',
                ),
                active=False,
                identity='confirm-delete-user-modal'
            ),
            core.Container(
                [
                    icons.Icon('fi-wrench'),
                    core.Text(' User Administration')
                ],
                style={},
                font_size=22,
                padding=8,
                margin_top='2rem',
            ),
            core.ViewPort(
                active='users',
                views={
                    'users': core.Box([
                        core.Grid([
                            core.Box([
                                icons.Icon('fi-torso'),
                                core.Text(' Username')],
                                margin_left='0.25rem',
                            ),
                            core.Box([
                                icons.Icon('fi-lock'),
                                core.Text(' Active')
                            ], justify='center'),
                            core.Box([
                                icons.Icon('fi-shield'),
                                core.Text(' User Roles')],
                                justify='center'),
                            core.Box(
                                [
                                    extra.PopUp(
                                        icons.Icon('fi-widget'),
                                        'Filters',
                                        content_style={'background': 'white'}
                                    )
                                ],
                                justify='flex-end',
                                margin_right='1rem',
                                identity='user-filter-toggle'
                            ),
                        ],
                            width='100%',
                            columns=4,
                            equal_cell_width=True,
                            style={
                                'userSelect': 'none',
                                'fontWeight': 'bold',
                                'fontSize': 18,
                                'padding': '0.5rem 0',
                            },
                            preset_background=PresetColor.NEUTRAL_DARK,
                        ),
                        core.Grid([
                            core.Box(
                                core.Input(
                                    placeholder='Filter username',
                                    style={'width': '100%', 'height': '80%'},
                                    identity='username-filter'
                                ),
                                width='100%',
                                height='100%',
                                align_items='center',
                                margin_left='0.25rem',
                            ),
                            core.Box(
                                core.Checkbox(
                                    indeterminate=True,
                                    preset_size=PresetSize.LARGE,
                                    identity='user-active-filter',
                                    click_indeterminate=True,
                                ),
                                justify='center',
                                align_items='center',
                                height='100%'
                            ),
                            core.Box(
                                core.Dropdown(
                                    options=role_names,
                                    identity='user-roles-filter',
                                    multi=True,
                                    style={'width': '100%', 'margin': 2},
                                ),
                                width='100%'
                            ),
                            core.Box(
                                core.Button(
                                    'Search',
                                    identity='apply-user-filters-btn',
                                    preset=PresetColor.PRIMARY,
                                    size=PresetSize.LARGE,
                                    bordered=False,
                                    rounded=True,
                                ),
                                justify='right'
                            )
                        ],
                            width='100%',
                            columns=4,
                            equal_cell_width=True,
                            preset_background=PresetColor.NEUTRAL_DARK,
                            identity='user-filters',
                            hidden=True,
                        ),
                        core.ListBox(
                            [
                                self.get_user_row(user, role_names)
                                for user in users
                            ],
                            identity='users-listbox',
                            flex_grow=1,
                            bordered=True,
                            style={'borderBottom': 'none'}
                        ),
                        core.Box([
                            extra.Pager(
                                total_items=user_count,
                                items_per_page=self.users_per_page,
                                pages_displayed=self.users_page_displayed,
                                identity='users-pager',
                                current_page=1,
                                next_label=icons.Icon('fi-arrow-right'),
                                previous_label=icons.Icon('fi-arrow-left'),
                            )
                        ],
                            centered=True,
                            padding='0.5rem 0',
                            preset_background=PresetColor.NEUTRAL,
                            border_radius='0 0 5px 5px'
                        )
                    ], column=True),
                    'roles': core.Container([
                        core.Grid(
                            [
                                core.Box(core.Input(
                                    placeholder='Role name',
                                    identity='new-role-name',
                                    style={'width': '90%'}
                                ),
                                    justify='flex-start',
                                    width='100%',
                                    height='80%',
                                    padding_left='0.25rem'
                                ),
                                core.Box(core.Input(
                                    placeholder='Description',
                                    identity='new-role-description',
                                    style={'width': '100%'}
                                ),
                                    height='80%',
                                    width='100%',
                                ),
                                core.Box(core.Button(
                                    'Create',
                                    identity='new-role-button',
                                    preset=PresetColor.PRIMARY,
                                    bordered=False,
                                    rounded=True,
                                    size=PresetSize.LARGE,
                                    disabled=True,
                                ),
                                    justify='flex-end',
                                    width='100%',
                                    padding_right='0.25rem'
                                )
                            ],
                            columns=3,
                            equal_cell_width=True,
                            center_cells=True,
                            preset_background=PresetColor.NEUTRAL_DARK,
                        ),
                        core.ListBox(
                            [
                                self.get_role_row(role)
                                for role in roles
                            ],
                            identity='role-listbox',
                            bordered=True,
                        ),
                    ]),
                },
                tabbed=True,
                tab_labels={
                    'users': core.Box(
                        [icons.Icon('fi-torsos-all'), core.Text(' Users')],
                        font_weight='bold',
                        font_size=20,
                        padding=8,
                        justify='center'
                    ),
                    'roles': core.Box(
                        [icons.Icon('fi-shield'), core.Text(' Roles')],
                        font_weight='bold',
                        font_size=20,
                        padding=8,
                        justify='center',
                    ),
                },
                style={'width': '80%'}
            ),
            core.ListBox(identity='toast-listbox'),
        ], identity='admin-page', column=True, align_items='center')

    def get_role_row(self, role: AdminRole):
        core = self._core
        icons = self._icons

        return core.Grid(
            [
                core.Box(core.Text(role.role_name),
                         justify='flex-start',
                         width='100%', margin_left='0.25rem'),
                core.Box(core.Input(
                    value=role.description,
                    identity=f'role-description${role.role_name}',
                    style={'width': '100%'}
                ), width='100%', height='80%'),
                core.Box(core.Button(
                    icons.Icon('fi-trash'),
                    circle=True,
                    bordered=False,
                    identity=f'remove-role${role.role_name}',
                    style={'width': '2rem', 'height': '2rem'},
                    preset=PresetColor.DANGER,
                    size=PresetSize.LARGE,
                ), width='100%', justify='flex-end', margin_right='0.25rem'),
            ],
            columns=3,
            equal_cell_width=True,
            center_cells=True,
            class_name='admin-row',
            identity=f'role-row-{role.role_name}',
            style={'borderBottom': '#e5e5ea solid 1px'},
        )

    def get_user_row(self, user: AdminUser, roles: typing.List[str]):
        core = self._core
        icons = self._icons

        return core.Grid([
            core.Box(
                user.username,
                width='100%',
                margin_left=4,
            ),
            core.Checkbox(
                checked=user.active,
                identity=f'active${user.username}',
                preset_size=PresetSize.LARGE,
            ),
            core.Dropdown(
                options=roles,
                value=user.roles,
                multi=True,
                style={'width': '100%', 'margin': 2},
                identity=f'user-roles${user.username}'
            ),
            core.Box([
                core.Button([
                    icons.Icon('fi-trash')
                ],
                    circle=True,
                    identity=f'delete${user.username}',
                    bordered=False,
                    style={
                        'width': '2rem',
                        'height': '2rem'
                    },
                    preset=PresetColor.DANGER,
                    size=PresetSize.LARGE,
                ),
            ],
                align_items='center',
                justify='flex-end',
                width='100%',
                margin_right=4
            ),
        ],
            columns=4,
            equal_cell_width=True,
            center_cells=True,
            style={'borderBottom': '#e5e5ea solid 1px'},
            identity=f'user-row${user.username}',
        )

    # Binding handlers

    async def on_toggle_user_active(self, ctx: CallContext):
        username = _get_trigger_meta(ctx.trigger.identity)
        await self.toggle_active_user(username, ctx.trigger.value)

    async def on_change_user_roles(self, ctx: CallContext):
        username = _get_trigger_meta(ctx.trigger.identity)
        await self.change_user_roles(username, ctx.trigger.value)

    async def on_delete_user(self, ctx: CallContext):
        username = ctx.states['delete-username']['text']
        await self.delete_user(username)

        ctx.set_aspect('delete-username', text='')
        ctx.set_aspect('confirm-delete-user-modal', active=False)
        ctx.set_aspect('users-listbox', delete_identity=f'user-row${username}')

    async def on_create_role(self, ctx: CallContext):
        role_name = ctx.states['new-role-name']['value']
        role_description = ctx.states['new-role-description']['value']
        role_data = ctx.states['roles-data']['data']

        try:
            await self.create_role(role_name, role_description)
            ctx.set_aspect(
                'role-listbox',
                append=self.get_role_row(
                    AdminRole(role_name, role_description)
                )
            )
            ctx.set_aspect('new-role-name', value='')
            ctx.set_aspect('new-role-description', value='')
            ctx.set_aspect('roles-data', data=role_data + [role_name])
        except Exception as err:  # pylint: disable=broad-except
            self.app.logger.exception(err)
            ctx.set_aspect(
                'toast-listbox',
                append=self._extra.Toast(
                    self._core.Text(traceback.format_exc()),
                    style={'border': 'red 3px solid'},
                    position='top-right',
                    delay=12000
                )
            )

    async def on_role_delete(self, ctx: CallContext):
        role_name = _get_trigger_meta(ctx.trigger.identity)
        roles = ctx.states['roles-data']['data']

        await self.delete_role(role_name)

        ctx.set_aspect('role-listbox', delete_identity=f'role-row-{role_name}')
        ctx.set_aspect('roles-data', data=[x for x in roles if x != role_name])

    async def _update_users(self, offset, roles, filters, ctx: CallContext):
        users = await self.get_users(offset, self.users_per_page, filters)

        ctx.set_aspect(
            'users-listbox',
            items=[self.get_user_row(user, roles) for user in users]
        )

    async def on_change_users_page(self, ctx: CallContext):
        offset = ctx.trigger.value
        roles = ctx.states['roles-data']['data']
        filters = ctx.states['user-filters-data']['data']

        await self._update_users(offset, roles, filters, ctx)

    async def on_apply_user_filters(self, ctx: CallContext):
        filters = ctx.trigger.value
        roles = ctx.states['roles-data']['data']

        await self._update_users(0, roles, filters, ctx)

        user_count = await self.get_user_count(filters)
        ctx.set_aspect('users-pager', total_items=user_count, current_page=1)

    async def on_description_change(self, ctx: CallContext):
        role_name = _get_trigger_meta(ctx.trigger.identity)
        await self.update_role_description(role_name, ctx.trigger.value)

    # To implement

    async def get_users(self, offset: int, limit: int, filters: dict = None):
        raise NotImplementedError

    async def get_user_count(self, filters: dict = None):
        raise NotImplementedError

    async def get_roles(self):
        raise NotImplementedError

    async def toggle_active_user(self, username: str, active: bool):
        raise NotImplementedError

    async def change_user_roles(self, username: str, roles: typing.List[str]):
        raise NotImplementedError

    async def delete_user(self, username: str):
        raise NotImplementedError

    async def create_role(self, role: str, description: str):
        raise NotImplementedError

    async def delete_role(self, role: str):
        raise NotImplementedError

    async def update_role_description(self, role: str, description: str):
        raise NotImplementedError
