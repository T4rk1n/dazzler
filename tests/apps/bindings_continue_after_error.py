from dazzler import Dazzler
from dazzler.components import core
from dazzler.system import Page, Trigger, BindingContext


app = Dazzler(__name__)


page = Page(
    name='error',
    url='/',
    layout=core.Container([
        core.Button('click', identity='click'),
        core.Button('click error', identity='click-error'),
        core.Container(identity='output')
    ])
)
app.add_page(page)


@page.bind(Trigger('click-error', 'clicks'))
async def on_click_error(_: BindingContext):
    raise Exception('Clicked error')


@page.bind(Trigger('click', 'clicks'))
async def on_click(context: BindingContext):
    await context.set_aspect(
        'output',
        children=f'Clicked {context.trigger.value}'
    )


if __name__ == '__main__':
    app.start('-v --debug=1 --port=8160'.split())
