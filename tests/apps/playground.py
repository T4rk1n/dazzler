from dazzler import Dazzler

from tests.apps.pages import component_as_trigger, binding_return_trigger, \
    same_identity, component_as_aspect, storage, regex_bindings
from tests.components.pages import checklist, store, html, interval, \
    input_output, radio, link, viewport, progress, select, button, slider, \
    modal, textarea, table, grid, form, markdown, calendar, pager, extras, \
    login, list_box, treeview, dropdown, page_map

app = Dazzler(__name__)
app.config.session.backend = 'Redis'
app.config.development.reload_threshold = 5.0

pages = [
    component_as_trigger.page,
    binding_return_trigger.page,
    same_identity.page,
    component_as_aspect.page,
    input_output.page,
    interval.page,
    checklist.page,
    html.page,
    radio.page,
    store.page,
    link.page,
    link.other_page,
    viewport.page,
    progress.page,
    select.page,
    button.page,
    slider.page,
    modal.page,
    textarea.page,
    table.page,
    grid.page,
    form.page,
    storage.page,
    markdown.page,
    calendar.page,
    pager.page,
    extras.page,
    login.page,
    regex_bindings.page,
    list_box.page,
    treeview.page,
    dropdown.page,
    page_map.page
]

app.add_page(*pages)


if __name__ == '__main__':
    app.start('-v --debug --port 8188 --reload')
