from dazzler.system import Page, transforms as t
from dazzler.components.core import Box, Container, Text
from dazzler.components.extra import ColorPicker

color_types = [
   'hex', 'rgb', 'rgba', 'hsl', 'hsla', 'hsv', 'hsva'
]

page = Page(
    __name__,
    Container([
        Box([
            ColorPicker(type=x, identity=f'{x}-picker') for x in color_types
        ]),
        Box([
            Text(identity=f'{x}-output') for x in color_types
        ], column=True),
        Box([
            ColorPicker(
                type='rgba',
                identity='colored-toggle',
                toggle_button_color=True,
                toggle_on_choose_delay=2000,
                value='rgba(255, 0, 0, 1)',
                as_string=True,
                bordered=True,
                rounded=True,
                padding=12,
            ),
            Text('Colored Output', identity='colored-output')
        ])
    ])
)

page.tie(f'value@colored-toggle', 'background@colored-output')

for color_type in color_types:
    page.tie(f'color@{color_type}-picker', f'text@{color_type}-output').t(
        t.ToJson()
    )
