from dazzler import Dazzler

from tests.hot_reload import hot_reload_page

app = Dazzler(__name__)

app.add_page(hot_reload_page.page)


if __name__ == '__main__':
    app.start(['--reload'])
