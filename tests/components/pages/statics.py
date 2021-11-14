from dazzler.components import core
from dazzler.system import Page, transforms as t

page = Page(__name__, core.Container([
    core.Container(identity='script-loaded'),
    core.Container(identity='script-loaded-output'),
    core.Container(identity='script-error-output', color='red'),
    core.Script('/static/script.js', identity='script'),
    core.Script('/error', identity='script-error'),
    core.Container('styled', identity='styled'),
    core.Container(identity='stylesheet-loaded-output'),
    core.Container(identity='stylesheet-error-output', color='red'),
    core.Stylesheet('/static/sheet.css', identity='sheet'),
    core.Stylesheet('/error', identity='sheet-error'),
]))

page.tie('loaded@script', 'children@script-loaded-output').transform(
    t.RawValue('loaded-output')
)
page.tie('error@script-error', 'children@script-error-output')

page.tie('loaded@sheet', 'children@stylesheet-loaded-output').transform(
    t.RawValue('loaded-output')
)
page.tie('error@sheet-error', 'children@stylesheet-error-output')
