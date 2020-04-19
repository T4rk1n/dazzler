from dazzler.components import core, extra
from dazzler.system import Page, BindingContext

page = Page(
    __name__,
    core.Container([
        extra.TreeView([
            'item12',
            {
                'identifier': 'nest',
                'label': 'nest',
                'items': [
                    'nested1',
                    'nested2',
                    {
                        'label': 'subnest',
                        'identifier': 'subnest',
                        'items': ['sub1', 'sub2']
                    }
                ],
            }
        ], identity='treeview'),
        core.Container(identity='output')
    ])
)


@page.bind('selected@treeview')
async def on_selected(ctx: BindingContext):
    await ctx.set_aspect('output', children=ctx.trigger.value)
