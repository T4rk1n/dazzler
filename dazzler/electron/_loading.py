from dazzler._assets import loading_window_path
from dazzler.tools import replace_all


def get_loading_options(config):
    opt = config.electron.loading_window.options
    return {
        'width': opt.width,
        'height': opt.height,
        'title': opt.title,
        'fullscreen': opt.fullscreen,
        'center': opt.center,
        'resizable': opt.resizable,
        'minimizable': opt.minimizable,
        'maximizable': opt.maximizable,
        'skipTaskbar': opt.skip_taskbar,
        'frame': opt.frame,
        'opacity': opt.opacity,
        'titleBarStyle': opt.title_bar_style,
        'click_through': opt.click_through
    }


def build_loading_html(config) -> str:
    path = config.electron.loading_window.html_file or loading_window_path
    with open(path) as f:
        html_content = f.read()
    return replace_all(
        html_content,
        title=config.electron.loading_window.title,
        header=config.electron.loading_window.header,
        footer=config.electron.loading_window.footer,
    )
