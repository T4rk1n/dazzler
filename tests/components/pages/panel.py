from dazzler.system import Page
from dazzler.components import core, html
from dazzler.presets import PresetColor


page = Page(
    __name__,
    html.Div([
        core.Panel(
            title='Panel one',
            content=core.Container(
                [
                    core.Container('Panel Content', height=300),
                    core.Text('Hidden')
                ],
                scrollable=True,
                max_height=200,
            )
        ),
        core.Panel(
            title='Panel two: expandable',
            content=core.Container('Expandable', height=200),
            expandable=True,
            expanded=False,
        ),
        core.Panel(
            title=html.H2('Color panels'),
            content=html.Div([
                core.Panel(
                    title=f'Panel color: {color} / {background}',
                    content=html.Div('content'),
                    preset_color=color,
                    preset_background=background,
                    title_color=background,
                    title_background=color,
                )
                for (color, background)
                in zip(PresetColor, reversed(PresetColor))
            ]),
            content_style={'padding': '8px'}
        ),
    ])
)
