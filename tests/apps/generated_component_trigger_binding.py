from dazzler import Dazzler
from dazzler.components import core
from dazzler.system import Page, Trigger, BindingContext

app = Dazzler(__name__)


page = Page(
    name='home',
    url='/',
    layout=core.Container([
        core.Button('click', identity='click'),
        core.Container(identity='output'),
        core.Container(identity='output2')
    ])
)
app.add_page(page)


@page.bind(Trigger('click', 'clicks'))
async def on_click(context: BindingContext):
    await context.set_aspect(
        'output',
        children=core.Button(
            'click twice', identity='generated'
        )
    )


@page.bind(Trigger('generated', 'clicks'))
async def on_generated_click(context: BindingContext):
    await context.set_aspect('output2', children='Generated')


if __name__ == '__main__':
    app.start('-v --debug=1 --port=8159'.split())
