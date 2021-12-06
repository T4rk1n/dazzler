from dazzler.components import core
from dazzler.system import Page

page = Page(__name__, core.Container([
    core.Text('second', identity='second')
]))
