from dazzler import Dazzler
from dazzler.system import Page
from dazzler.components.extra import PageMap

app = Dazzler(__name__)
app.add_page(Page('index', PageMap(), url='/'))

if __name__ == '__main__':
    app.start('--debug -v --port=8199 --reload')
