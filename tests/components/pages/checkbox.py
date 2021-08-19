from dazzler.system import Page, BindingContext, transforms as t
from dazzler.components.core import Checkbox, Box, Button
from dazzler.presets import PresetSize

page = Page(
    __name__,
    Box([
        Button('bind', identity='bind'),
        Button('transform', identity='transform'),
        Checkbox(checked=True, identity='checked'),
        Checkbox(indeterminate=True, identity='indeterminate'),
        Checkbox(checked=True, identity='dynamic'),
        Checkbox(identity='preset-size', preset_size=PresetSize.LARGER),
    ], column=True)
)

page.tie('clicks@transform', 'checked@dynamic').transform(
    t.AspectValue('checked@dynamic').t(t.Not())
)


@page.bind('clicks@bind')
async def on_bind_click(ctx: BindingContext):
    checked = await ctx.get_aspect('dynamic', 'checked')
    await ctx.set_aspect(
        'dynamic', checked=not checked
    )
