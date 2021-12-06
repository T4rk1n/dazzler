from dazzler import Dazzler
from dazzler.components import core, icons
from dazzler.presets import PresetColor
from dazzler.system import BindingContext

app = Dazzler(__name__)

app.header.layout = core.Container([
    icons.IconLoader(),
    icons.FoundIconPack(),
    core.Box([
        core.Box([
            icons.Icon('fi-home'),
            core.Text(' Header', identity='header')
        ]),
        core.Box([
            core.Button('bind-header-clicker', identity='bind-header-clicker'),
            core.Text(identity='bind-header-output'),
            core.Button('tie-header-clicker', identity='tie-header-clicker'),
            core.Text(identity='tie-header-output'),
        ])
    ], justify='space-between')
], preset_background=PresetColor.PRIMARY_DARK, color='white')

app.footer.layout = core.Container([
    core.Text('Footer', identity='footer'),
    core.Box([
        core.Button('bind-footer-clicker', identity='bind-footer-clicker'),
        core.Text(identity='bind-footer-output'),
        core.Button('tie-footer-clicker', identity='tie-footer-clicker'),
        core.Text(identity='tie-footer-output'),
    ])
], preset_background=PresetColor.DARK, color='white')

app.header.tie('clicks@tie-header-clicker', 'text@tie-header-output')
app.footer.tie('clicks@tie-footer-clicker', 'text@tie-footer-output')


@app.header.bind('clicks@bind-header-clicker')
async def on_header_clicks(ctx: BindingContext):
    await ctx.set_aspect('bind-header-output', text=ctx.trigger.value)


@app.header.bind('clicks@bind-footer-clicker')
async def on_footer_clicks(ctx: BindingContext):
    await ctx.set_aspect('bind-footer-output', text=ctx.trigger.value)


if __name__ == '__main__':
    app.start('-v --debug --reload')
