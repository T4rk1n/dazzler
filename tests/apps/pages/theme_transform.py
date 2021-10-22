from dazzler.system import Page, transforms as t
from dazzler.components import core

page = Page(
    __name__,
    core.Container([
        core.Container('Theme transform'),
        core.Container(identity='mode'),
        core.Box([
            core.Text(
                'Choose theme: ',
                font_weight='bold',
                align_self='center'
            ),
            core.Dropdown(
                options=['light', 'dark'],
                value='light',
                identity='theme-dropdown',
                style={'width': '300px'}
            ),
        ]),
    ], identity='layout', style={'height': '100vh'})
)

page.tie('value@theme-dropdown', 'style@layout').transform(
    t.If(
        t.Equals('light'),
        then=(
            t.AspectValue('style@layout').t(
                t.Merge({'background': 'white', 'color': 'black'}))
        ),
        otherwise=(
            t.AspectValue('style@layout').t(
                t.Merge({'background': 'black', 'color': 'white'}))
        )
    )
)
# Contrary to bindings, you can attach multiples ties to the same trigger.
page.tie('value@theme-dropdown', 'children@mode').transform(
    t.Format('Theme selected: ${value}')
)
