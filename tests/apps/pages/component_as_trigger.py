"""
Page component_as_trigger of dazzler
Created 2019-06-16
"""
import json

from dazzler.components import core
from dazzler.system import Page, Trigger, BindingContext, State

page = Page(
    __name__,
    core.Container([
        core.Container(core.Container('from children'), identity='component'),
        core.Container(identity='output'),
        core.Container([
            core.Container(str(x)) for x in range(0, 10)
        ], identity='array-components'),
        core.Container(identity='array-output'),

        core.Container(core.Container(core.Container([
            core.Html(
                'div', core.Container('inside html div'),
                identity='inside-html'
            ),
            core.Html(
                'div',
                attributes={'children': core.Html('span', 'attribute')}
            ),
        ])), identity='nested-components'),
        core.Container(identity='nested-output'),

        core.Button('get-aspect-click', identity='get-aspect-trigger'),
        core.Container(
            core.Input(value='input-value'),
            identity='input'
        ),
        core.Container(core.Input(value=4747), identity='as-state'),
        core.Container(identity='get-aspect-output'),
        core.Container(identity='as-state-output')
    ])
)


@page.bind(Trigger('component', 'children'))
async def trigger(ctx: BindingContext):
    await ctx.set_aspect(
        'output', children=f'From component: {ctx.trigger.value.children}'
    )


@page.bind(Trigger('array-components', 'children'))
async def trigger_array_components(ctx: BindingContext):
    # The value is an array of container.
    value = sum(int(x.children) for x in ctx.trigger.value)
    await ctx.set_aspect(
        'array-output',
        children=f'Sum: {value}'
    )


@page.bind(Trigger('nested-components', 'children'))
async def trigger_nested_components(ctx: BindingContext):
    children = ctx.trigger.value.children.children
    output = {
        'len': len(children),
        'insider': children[0].children.children,
        # This one in the attributes, not the children as per the
        # original component, the children prop is a different aspect.
        'as_prop': children[1].attributes['children'].children,
    }
    await ctx.set_aspect('nested-output', children=json.dumps(output))


@page.bind(
    Trigger('get-aspect-trigger', 'clicks'), State('as-state', 'children')
)
async def get_aspect_component_with_state(ctx: BindingContext):
    component = await ctx.get_aspect('input', 'children')
    await ctx.set_aspect(
        'get-aspect-output', children=json.dumps({
            'get-aspect': component.value,
            'state': ctx.states['as-state']['children'].value
        })
    )
