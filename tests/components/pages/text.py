from dazzler.system import Page
from dazzler.components.core import Box, Text

page = Page(
    __name__,
    Box([
        Text('Foo Bar', identity='foo-bar'),
        Text('Bold', font_weight='bold', identity='bold'),
        Text('Italic', font_style='italic', identity='italic'),
        Text('Bigger', font_size=32, identity='big'),
    ], font_family='courier', column=True)
)
