from dazzler.presets import PresetColor, PresetSize
from dazzler.system import Page
from dazzler.components.core import Box, Text, Container, Grid

page = Page(
    __name__,
    Box([
        Text(
            'Foobar',
            padding=10,
            margin=5,
            identity='padded-margin'
        ),
        Text(
            'Fizz',
            border='1px solid black',
            border_radius=3,
            identity='border'
        ),
        Text(
            'Buzz',
            background='blue',
            color='red',
            identity='colored'
        ),
        # Presets
        Container([
            Text(
                'boxed',
                bordered=True,
                rounded=True,
                identity='preset-bordered',
            ),
            Text(
                'boxed-two',
                centered=True,
                height=300,
                width='100%',
                identity='preset-centered'
            ),
            Text(
                'preset',
                preset_size=PresetSize.X_LARGE,
                preset_color='primary',
                preset_background='warning',
                identity='preset-color'
            ),
        ], scrollable=True, max_height=200, identity='preset-container'),
        Grid([
            Box(
                f'{fg}/{bg}',
                preset_color=fg,
                preset_background=bg,
                padding=3,
            ) for bg, fg in zip(PresetColor, reversed(PresetColor))
        ], columns=5, equal_cell_width=True)
    ], column=True)
)

