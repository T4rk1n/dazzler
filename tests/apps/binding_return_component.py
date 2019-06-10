from dazzler import Dazzler
from dazzler.components import core
from dazzler.system import Page, Trigger, BindingContext


page = Page(
    name='page',
    url='/',
    layout=core.Container([
        core.Container('click', identity='clicker', id='clicker'),
        core.Container('output', identity='output', id='output')
    ])
)

app = Dazzler(__name__)
app.add_page(page)


@page.bind(Trigger('clicker', 'n_clicks'))
async def on_click(context: BindingContext):
    await context.set_aspect(
        'output',
        children=core.Container('from binding', id='from-binding')
    )


if __name__ == '__main__':
    app.start('-v --debug=1 --port=8151'.split())
