"""
Page viewport of dazzler
Created 2019-06-24
"""
from dazzler.components import core
from dazzler.system import Page, Trigger, BindingContext

views = ['first', 'second', 'third']
tabs = ['one', 'two', 'three']

page = Page(
    __name__,
    core.Container([
        core.Container([
            core.Button(
                f'Toggle {x}', identity=f'toggle-{x}'
            )
            for x in views
        ], class_name='column'),
        core.ViewPort(views[0], {
            x: core.Container(x, identity=x) for x in views
        }, identity='viewport'),

        core.Container([
            core.Button(
                f'Modify {x}', identity=f'modify-{x}'
            )
            for x in views
        ]),
        core.ViewPort('one', {
            x: core.Container(x) for x in tabs
        }, identity='tabs', tabbed=True, tab_labels={
            x: x.upper() for x in tabs
        }, rounded_tabs=True, bordered=True),
    ])
)


async def activate_view(ctx: BindingContext):
    await ctx.set_aspect(
        'viewport',
        active=ctx.trigger.identity.replace('toggle-', '')
    )


async def modify(ctx: BindingContext):
    identity = ctx.identity.replace('modify-', '')
    await ctx.set_aspect(identity, children=f'Modified {identity}')

for view in views:
    page.bind(Trigger(f'toggle-{view}', 'clicks'))(activate_view)
    page.bind(Trigger(f'modify-{view}', 'clicks'))(modify)
