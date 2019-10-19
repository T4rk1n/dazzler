import pytest


@pytest.mark.async_test
async def test_login_logout(start_page, browser):
    from tests.components.pages.login import page

    await start_page(page)

    user_input = await browser.wait_for_element_by_css_selector(
        '#login-username-login-form'
    )
    password_input = await browser.wait_for_element_by_css_selector(
        '#login-password-login-form'
    )

    user_input.send_keys('Bob')
    password_input.send_keys('foobar')

    await browser.click('#login-form .login-button')

    await browser.wait_for_text_to_equal('#login-label', 'Logged in as Bob')

    await browser.click('#logout .logout-button')
    await browser.wait_for_text_to_equal('#login-label', 'Please login')
