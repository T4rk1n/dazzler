from dazzler import Dazzler
from dazzler.system import Page
from dazzler.electron import is_compiled, ElectronWindowSettings
from dazzler.components import core

app = Dazzler(__name__)
page = Page(
    'main',
    core.Container([
        core.Container('Main', identity='main'),
        core.Button('Click', identity='clicker'),
        core.Container(identity='output')
    ]),
    electron_window=ElectronWindowSettings(
        width=800,
        height=600,
        fullscreen=False,
        menu_bar=False,
    )
)
app.add_page(page)


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
        app.start('-v --reload')
