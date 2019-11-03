from dazzler import Dazzler

from tests.hot_reload import hot_reload_page

app = Dazzler(__name__)

app.config.session.backend = 'Redis'
app.config.development.reload_threshold = 0.1
app.add_page(hot_reload_page.page)


if __name__ == '__main__':
    app.start('--v --reload --debug')
