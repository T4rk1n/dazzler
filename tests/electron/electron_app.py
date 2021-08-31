from dazzler import Dazzler
from dazzler.system import Page, transforms as t
from dazzler.electron import is_compiled, ElectronWindowSettings
from dazzler.components import core
from dazzler.components.electron import WindowState

number_states = ['x', 'y', 'width', 'height']
boolean_states = [
    'fullscreen', 'minimizable', 'minimized', 'closable',
    'resizable', 'focus', 'movable', 'maximizable',
    'maximized',
]

app = Dazzler(__name__)
page = Page(
    'main',
    core.Container([
        core.Container('Main', identity='main'),
        core.Button('Click', identity='clicker'),
        core.Container(identity='output'),
        WindowState(identity='window-state'),
        core.Text('WindowState:', font_weight='bold'),
        core.Container([
            core.Box([
                core.Text(f'{x}: '),
                core.Text(identity=f'{x}-status')]
            ) for x in number_states + boolean_states
        ]),
        core.Container([
            core.Box([
                core.Text(f'{x}: '),
                core.Input(type='number', identity=f'{x}-input')]
            ) for x in number_states
        ]),
        core.Container([
            core.Box([
                core.Text(f'{x}: '),
                core.Checkbox(identity=f'{x}-checkbox')]
            ) for x in boolean_states
        ]),
    ]),
    electron_window=ElectronWindowSettings(
        width=750,
        height=550,
        fullscreen=False,
        menu_bar=True,
    )
)
app.add_page(page)

for state in number_states:
    #  Executes only once because of race condition between ipc/effects.
    page.tie(f'{state}@window-state', f'value@{state}-input', once=True)
    page.tie(f'value@{state}-input', f'set_{state}@window-state')

for state in number_states + boolean_states:
    page.tie(f'{state}@window-state', f'text@{state}-status').t(t.ToJson())

for state in boolean_states:
    page.tie(f'{state}@window-state', f'checked@{state}-checkbox', once=True)
    page.tie(f'checked@{state}-checkbox', f'set_{state}@window-state')


# Should assert that bindings works
@page.bind('clicks@clicker')
async def on_click(ctx):
    await ctx.set_aspect('output', children=f'Clicks {ctx.trigger.value}')


if __name__ == '__main__':
    if is_compiled():
        app.start('')
    else:
        # TODO When reloading is present, the server is harder to kill
        #  So need to assert that it can close and restart.
        app.start('-v --reload --debug')
