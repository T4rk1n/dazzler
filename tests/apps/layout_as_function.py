from dazzler import Dazzler
from dazzler.components import core
from dazzler.system import Page

app = Dazzler(__name__)


async def layout(_):
    return core.Container('Layout as function', identity='layout')


page = Page(
    __name__,
    url='/',
    layout=layout,
)
app.add_page(page)


if __name__ == '__main__':
    app.start('-v --debug=1 --port=5420'.split())
