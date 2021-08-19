from dazzler.components import core
from dazzler.system import Page, transforms as t
from dazzler.presets import PresetSize, PresetColor

page = Page(
    __name__,
    core.Container([
        core.Container([
            core.Switch(
                rounded=True,
                value=True,
                preset_color=PresetColor.PRIMARY,
                identity='switch'
            ),
            core.Switch(
                preset_color=PresetColor.SECONDARY
            ),
            core.Switch(
                preset_color=PresetColor.SECONDARY
            ),
            core.Switch(
                preset_color=PresetColor.TERTIARY
            ),
            core.Switch(
                preset_color=PresetColor.DANGER
            ),
            core.Switch(
                preset_color=PresetColor.WARNING
            ),
            core.Switch(
                preset_color=PresetColor.SUCCESS
            ),
            core.Switch(
                rounded=False,
            ),
            core.Switch(),
            core.Switch(
                disabled=True,
            ),
            core.Switch(
                disabled=True,
                value=True,
            ),
            core.Container(identity='output')
        ], padding='1rem', class_name='row'),

        core.Container([
            core.Switch(preset_size=p)
            for p in PresetSize
        ], class_name='row')
    ]),
)

page.tie('value@switch', 'children@output').t(t.Format('Value: ${value}'))
