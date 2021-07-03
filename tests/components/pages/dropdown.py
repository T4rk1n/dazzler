import json

from dazzler.components import core
from dazzler.system import Page, BindingContext

backend_options = [
    'foo',
    'bar',
    'help',
    'hell',
    'hello',
    'world'
]


with open('./tests/components/dropdown_data.json') as f:
    movies = json.load(f)


basic_options = [{'label': f'Option {x}', 'value': x} for x in range(1, 11)]

page = Page(
    __name__,
    core.Container([
        core.Dropdown(
            basic_options,
            identity='simple-dropdown'
        ),

        core.Dropdown(
            basic_options,
            identity='multi-dropdown',
            multi=True
        ),

        core.Dropdown(
            [
                {
                    'label': core.Container(
                        [
                            movie['title'],
                            core.Container(
                                f' {movie["year"]}',
                                style={'fontWeight': 'bold'}
                            )
                        ],
                        title=movie['director']
                    ),
                    'value': {
                        **movie,
                        'genres': movie['genres'].split('|')
                    }
                }
                for movie in movies
            ],
            identity='search-dropdown',
            searchable=True,
            scrollable=True,
            multi=True
        ),
        core.Dropdown(
            [
                'title',
                'keyword',
                'genres',
                'year'
            ],
            identity='search-props-dropdown',
            multi=True
        ),
        core.Container(
            [
                'Search label',
                core.Input(type='checkbox', identity='search-label-checkbox')
            ]
        ),
        core.Dropdown(
            backend_options,
            identity='search-backend-dropdown',
            searchable=True,
            search_backend=True
        ),
        core.Container(identity='simple-output'),
        core.Container(identity='multi-output'),
        core.Dropdown(
            options=['one', 'two'],
            value='one',
            identity='initial-value-dropdown'
        ),
        core.Dropdown(
            options=basic_options,
            value=basic_options[0],
            identity='initial-value-object-dropdown'
        ),
        core.Dropdown(
            options=basic_options,
            multi=True,
            value=[basic_options[0], basic_options[1]],
            identity='initial-value-multi-dropdown'
        )
    ], style={'width': '300px', 'padding': '1rem'})
)


@page.bind('value@simple-dropdown')
async def on_select(ctx: BindingContext):
    await ctx.set_aspect(
        'simple-output',
        children=ctx.trigger.value
    )


@page.bind('value@multi-dropdown')
async def on_multi_output(ctx: BindingContext):
    await ctx.set_aspect(
        'multi-output',
        children=json.dumps(ctx.trigger.value)
    )


@page.bind('value@search-props-dropdown')
async def on_search_props(ctx: BindingContext):
    await ctx.set_aspect('search-dropdown', search_props=ctx.trigger.value)


@page.bind('value@search-label-checkbox')
async def on_search_label(ctx: BindingContext):
    await ctx.set_aspect('search-dropdown', search_label=ctx.trigger.value)


@page.bind('search_value@search-backend-dropdown')
async def on_search_backend(ctx: BindingContext):
    options = [
        x for x in backend_options if ctx.trigger.value in x
    ]
    await ctx.set_aspect('search-backend-dropdown', filtered_options=options)
