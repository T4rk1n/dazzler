from dazzler import Dazzler
from dazzler.system import Page

from dazzler.components import core

app = Dazzler(__name__)
app.config.requirements.prefer_external = True

app.add_page(Page('index', core.Container('foo'), url='/'))

