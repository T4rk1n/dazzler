from dazzler import Dazzler
from dazzler.components import core
from dazzler.system import Page, BindingContext, Trigger

from tests.components import spec_components as spec

app = Dazzler(__name__)

aspect_types = {
    'array': {
        'value': [1, 2, 3],
        'json': True,
    },
    'bool': {
        'value': True,
    },
    'number': {
        'value': 42,
    },
    'object': {
        'value': {'foo': 'bar'},
        'json': True,
    },
    'string': {
        'value': 'foo bar',
    },
    'enum': {
        'value': 'News',
    },
    'union': {
        'value': 1,
    },
    'array_of': {
        'value': [6, 7, 8, 9],
        'json': True,
    },
    'shape': {
        'value': {'color': '#000', 'fontSize': 777},
        'json': True,
    },
}

button_ids = ['set-{}'.format(y) for y in aspect_types.keys()]
output_ids = ['out-{}'.format(y) for y in aspect_types.keys()]

layout = core.Container([
    core.Container([core.Button(x, identity=x) for x in button_ids]),
    spec.TestComponent('', identity='spec-output', id='spec-output'),
])

page = Page(
    'page',
    url='/',
    layout=layout
)

app.add_page(page)


async def on_click_render_type(context: BindingContext):
    identity = context.trigger.identity.replace('set-', '')
    await context.set_aspect(
        f'spec-output',
        **{f'{identity}_prop': aspect_types[identity]['value']}
    )


for button in button_ids:
    page.bind(Trigger(button, 'clicks'))(on_click_render_type)


if __name__ == '__main__':
    app.start('-v --debug=1 --port=8155'.split())
