import os

from dazzler import Dazzler
from dazzler.tools import get_package_path

from tests.apps.pages import component_as_trigger, binding_return_trigger, \
    same_identity, component_as_aspect, storage, regex_bindings, ties, \
    transformations, theme_transform, once, calls
from tests.components.pages import checklist, store, html, interval, \
    input_output, radio, link, viewport, progress, select, button, slider, \
    modal, textarea, table, grid, form, markdown, calendar, pager, extras, \
    login, list_box, treeview, dropdown, page_map, icons, ts, text,\
    checkbox, common_styles, switch, color_picker, panel, statics
from tests.apps.samples import progress_update

app = Dazzler(__name__)
app.config.session.backend = 'Redis'
app.config.development.reload_threshold = 5.0
app.config.static_folder = os.path.join(get_package_path(__name__), 'static')

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
    theme_transform.page,
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
    transformations.page,
    dropdown.page,
    ties.page,
    page_map.page,
    icons.page,
    progress_update.page,
    ts.page,
    text.page,
    checkbox.page,
    common_styles.page,
    switch.page,
    color_picker.page,
    once.page,
    calls.page,
    panel.page,
    statics.page,
]

app.add_page(*pages)


if __name__ == '__main__':
    app.start('-v --debug --port 8188 --reload')
