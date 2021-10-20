from dazzler.system import Page, transforms as t
from dazzler.components import html


page = Page(
    __name__,
    html.Div([
        html.H1('Dazzler html components'),
        html.Main([
            html.Section([
                html.H3('Inputs'),
                html.Div('clicker', identity='clicker', handle_clicks=True),
                html.Select([
                    html.Option('opt 1', value=1),
                    html.Option('opt 2', value=2),
                    html.Option('opt 3', value=3)
                ], handle_focus=True, identity='focus-select'),
                html.Div(
                    'Hoverable',
                    identity='hoverable',
                    handle_hover=True,
                    style={'padding': 12, 'background': '#dcdcdc'}
                ),
            ]),
            html.Section([
                html.H3('Outputs'),
                html.Div(identity='clicker-output'),
                html.Div(identity='clicker-event-output'),
                html.Div(identity='hover-output'),
                html.Div(identity='focus-output'),
            ]),
        ]),
    ]),
    packages=['dazzler_html']
)

page.tie('clicks@clicker', 'children@clicker-output')
page.tie('click_event@clicker', 'children@clicker-event-output').transform(
    t.ToJson()
)
page.tie('is_focused@focus-select', 'children@focus-output').transform(
    t.Format('Focused: ${value}')
)
page.tie('is_hovered@hoverable', 'children@hover-output').transform(
    t.Format('Hovered: ${value}')
)
