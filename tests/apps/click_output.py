from dazzler import Dazzler
from dazzler.components import core
from dazzler.system import Page, Trigger, BindingContext, State

page = Page(
    name='home',
    url='/',
    layout=core.Container([
        core.Container(children='Click me', identity='clicker', id='clicker'),
        core.Container(children='Not clicked', identity='output', id='output'),
        core.DataList([
            {'value': 'hello', 'label': 'world'},
            {'value': 'foo', 'label': 'Foo'}
        ], identity='dropdown', id='dropdown'),
        core.Container('No data', identity='datalist-output'),
    ])
)


@page.bind(Trigger('clicker', 'n_clicks'), State('dropdown', 'data_value'))
async def on_click(context: BindingContext):
    await context.set_aspect(
        'output',
        children=f'Clicked {context.trigger.value}',
        style={
            'backgroundColor':
                'blue' if context.trigger.value % 2 == 0 else 'red'
        }
    )
    data_value = context.states['dropdown']['data_value']
    if data_value:
        await context.set_aspect(
            'datalist-output',
            children=f'Data {data_value}'
        )


app = Dazzler(__name__)
app.add_page(page)


if __name__ == '__main__':
    app.start('-v --debug 1 --port=5419'.split())
