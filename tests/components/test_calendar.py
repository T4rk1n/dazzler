import datetime

import pytest


@pytest.mark.async_test
async def test_calendar(start_page, browser):
    from tests.components.pages import calendar

    await start_page(calendar.page)

    now = datetime.datetime.now()

    await browser.wait_for_text_to_equal(
        '#initial-calendar .month-label', now.strftime('%B %Y')
    )
    await browser.wait_for_text_to_equal(
        '#past-calendar .month-label', calendar.past.strftime('%B %Y')
    )
    await browser.wait_for_text_to_equal(
        '#future-calendar .month-label', calendar.future.strftime('%B %Y')
    )
