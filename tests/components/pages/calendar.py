"""
Page calendar of dazzler
Created 2019-08-24
"""
import datetime
import pytz

from dazzler.components import core, calendar
from dazzler.system import Page

past = datetime.datetime(day=22, month=11, year=1986, tzinfo=pytz.utc)
future = datetime.datetime(day=11, month=9, year=2031, tzinfo=pytz.utc)

page = Page(
    __name__,
    core.Container([
        calendar.Calendar(identity='initial-calendar'),
        # FIXME * 1000 JavaScript are in ms where Python ts in seconds.
        calendar.Calendar(
            datetime.datetime.timestamp(past) * 1000,
            identity='past-calendar'
        ),
        calendar.Calendar(
            datetime.datetime.timestamp(future) * 1000,
            identity='future-calendar'
        ),
        calendar.Calendar(use_selected=False),
        calendar.DatePicker(identity='single-picker'),
        calendar.TimePicker(fallback_mode=True, identity='time-picker'),
        calendar.Timestamp(past.timestamp() * 1000, format='DD MM YYYY'),
    ])
)
