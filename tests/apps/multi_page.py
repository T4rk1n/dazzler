from dazzler import Dazzler
from dazzler.components import core
from dazzler.system import Page

app = Dazzler(__name__)

for num in ('one', 'two', 'three', 'four'):
    page = Page(
        name=num,
        layout=core.Container(f'Page {num}', identity='content'),
        title=f'Page {num}',
    )

    app.add_page(page)


if __name__ == '__main__':
    app.start('-v --debug 1'.split())
