import os

from dazzler import Dazzler
from dazzler.system import Page, Requirement

from dazzler.components import core

from dazzler._assets import vendors_path

app = Dazzler(__name__)
app.requirements.append(Requirement(internal=os.path.join(vendors_path, 'lodash.min.js')))

app.add_page(Page('index', core.Container('foo'), url='/'))

