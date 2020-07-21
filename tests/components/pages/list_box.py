"""
Page list_box of dazzler
Created 2019-11-28
"""
from dazzler.components import core
from dazzler.system import Page, Trigger, BindingContext

lb_component = core.ListBox(
    [
        core.Container(f'initial-{x}', class_name='item')
        for x in range(5)
    ],
    identity='list-box'
)

page = Page(
    __name__,
    core.Container([
        lb_component,
        core.Container([
            core.Button('append', identity='append-btn'),
            core.Button('prepend', identity='prepend-btn'),
            core.Button('concat', identity='concat-btn'),
            core.Button('insert', identity='insert-btn'),
            core.Input(identity='index-input', type='number'),
            core.Button('delete', identity='delete-btn')
        ])
    ])
)


# Add an element to the end.
@page.bind(Trigger('append-btn', 'clicks'))
async def on_append(ctx: BindingContext):
    await ctx.set_aspect(
        'list-box', append=core.Container(
            'appended', class_name='item append'
        )
    )


# Add an element to the start of the list.
@page.bind(Trigger('prepend-btn', 'clicks'))
async def on_prepend(ctx: BindingContext):
    await ctx.set_aspect(
        'list-box', prepend=core.Container(
            'prepended', class_name='item prepend'
        )
    )


# Add multiple elements to the end of the list.
@page.bind(Trigger('concat-btn', 'clicks'))
async def on_concat(ctx: BindingContext):
    await ctx.set_aspect(
        'list-box', concat=[
            core.Container(f'concat-{x}', class_name='item concat')
            for x in range(await ctx.get_aspect('index-input', 'value'))
        ]
    )


# Insert at a position.
@page.bind(Trigger('insert-btn', 'clicks'))
async def on_insert(ctx: BindingContext):
    index = await ctx.get_aspect('index-input', 'value')
    await ctx.set_aspect(
        'list-box', insert={
            'index': index,
            'item': core.Container('inserted', class_name='item insert')
        }
    )


# Delete the item at the index.
@page.bind(Trigger('delete-btn', 'clicks'))
async def on_delete(ctx: BindingContext):
    index = await ctx.get_aspect('index-input', 'value')
    await ctx.set_aspect(
        'list-box', delete_index=index
    )
