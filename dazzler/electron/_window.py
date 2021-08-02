from typing import Optional
try:
    from typing import TypedDict  # pylint: disable=no-name-in-module
except ImportError:
    TypedDict = dict


class ElectronWindowSettings(TypedDict):
    x: Optional[int]
    y: Optional[int]
    width: Optional[int]
    height: Optional[int]
    fullscreen: Optional[bool]
    fullscreenable: Optional[bool]
    opacity: Optional[float]
    center: Optional[bool]
    resizable: Optional[bool]
    minimizable: Optional[bool]
    focusable: Optional[bool]
    closable: Optional[bool]
    skip_taskbar: Optional[bool]
    transparent: Optional[bool]
    frame: Optional[bool]
    rounded_corner: Optional[bool]
    title_bar_style: Optional[str]
    menu_bar: Optional[bool]
    auto_hide_menu_bar: Optional[bool]
