import os

from dazzler import Dazzler
from dazzler.system import Page, Requirement

from dazzler.components import core

app = Dazzler(__name__)
app.requirements.append(
    Requirement(
        internal=os.path.join(
            os.path.dirname(__file__), 'pages', 'withRequirements.js'
        )
    )
)

app.add_page(Page('index', core.Container('foo'), url='/'))
