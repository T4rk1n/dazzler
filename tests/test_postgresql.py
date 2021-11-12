import asyncio
import uuid

import pytest

from dazzler import Dazzler
from dazzler.components import core, auth
from dazzler.system import Page, CallContext

user = 'john'
pw = 'Security1st'

admin = 'ultra'
admin_pw = 'LongerThan8'


extra_users = [
    (f'extra{i}', f'ExtraSecure{i}') for i in range(20)
]

base_url = 'http://localhost:8150/'
login_url = f'{base_url}auth'
admin_url = f'{base_url}auth/admin'


async def logout(browser):
    if browser.driver.current_url != base_url:
        await browser.get(base_url)

    await browser.click('#logout .logout-button')
    await browser.wait_for_text_to_equal('#username', 'username')


async def login_user(browser, username, password):
    await browser.get(login_url)
    login_username = await browser.wait_for_element_by_css_selector(
        '#login-form .login-username'
    )
    login_username.send_keys(username)
    login_password = await browser.wait_for_element_by_css_selector(
        '#login-form .login-password'
    )
    login_password.send_keys(password)
    await browser.click('#login-form .login-button')


async def login_admin(browser):
    await login_user(browser, admin, admin_pw)
    await browser.get(admin_url)


@pytest.fixture(autouse=True)
def auto_logout(browser):
    yield
    loop = asyncio.get_event_loop()
    task = loop.create_task(
        logout(browser)
    )
    loop.run_until_complete(task)


@pytest.fixture(scope='module', autouse=True)
def pg_app():
    app = Dazzler(__name__)
    app.config.secret_key = uuid.uuid4().hex
    app.config.session.backend = 'PostgreSQL'
    app.config.authentication.enable = True
    app.config.authentication.authenticator =\
        'dazzler.contrib.postgresql:PostgresAuthenticator'
    app.config.authentication.admin.enable = True
    app.config.authentication.admin.page_ref =\
        'dazzler.contrib.postgresql:PostgresUserAdminPage'
    app.config.authentication.register.next_url = '/'
    app.config.authentication.register.require_email = False

    page = Page(
        __name__,
        core.Container([
            core.Container('username', color='primary', identity='username'),
            auth.Logout('/auth/logout', identity='logout')
        ]),
        url='/'
    )

    @page.call('color@username', once=True)
    async def on_username(ctx: CallContext):
        if ctx.user:
            ctx.set_aspect(
                'username',
                children=f'{ctx.user.username}'
            )

    app.add_page(page)

    async def setup_app():
        await app.main(blocking=False)
        pool = app.server.app['postgres']

        await app.auth.authenticator.register_user(admin, admin_pw)

        for extra_username, extra_pw in extra_users:
            await app.auth.authenticator.register_user(
                extra_username, extra_pw
            )

        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    '''
                    insert into public.user_roles (role_id, user_id)
                    values (
                        (select role_id from public.role where name = 'admin'),
                        (select user_id from public.users
                            where username = 'ultra')
                    )
                    '''
                )

    loop = asyncio.get_event_loop()
    task = loop.create_task(
        setup_app()
    )
    loop.run_until_complete(task)
    yield app

    async def teardown():
        pool = app.server.app['postgres']

        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    '''
                    delete from public.users
                    where username = any('{ultra,john}') or username ~ 'extra';
                    delete from public.role where name = 'new_role';
                    '''
                )

        await app.stop()

    loop = asyncio.get_event_loop()
    task = loop.create_task(
        teardown()
    )
    loop.run_until_complete(task)


@pytest.mark.async_test
async def test_register(browser):
    await browser.get('http://localhost:8150/auth/register')

    username_input = await browser.wait_for_element_by_css_selector(
        'div.form-field:nth-child(1) > input:nth-child(2)'
    )
    username_input.send_keys(user)
    password_input = await browser.wait_for_element_by_css_selector(
        'div.form-field:nth-child(2) > input:nth-child(2)'
    )
    password_input.send_keys(pw)
    await browser.click('.form-submit')
    await browser.wait_for_text_to_equal('#username', user)

    await browser.get('http://localhost:8150/auth/admin')
    await browser.wait_for_text_to_equal('body', '403: Forbidden')


@pytest.mark.async_test
async def test_admin_user_toggle_active(browser):
    await login_admin(browser)

    extra_username, extra_pw = extra_users[0]

    await browser.click(f'#active\\${extra_username}')

    await logout(browser)
    await login_user(browser, extra_username, extra_pw)
    await browser.wait_for_text_to_equal(
        '#login-error', 'Invalid credentials'
    )

    await login_admin(browser)
    await browser.click(f'#active\\${extra_username}')
    await logout(browser)
    await login_user(browser, extra_username, extra_pw)
    await browser.wait_for_text_to_equal('#username', extra_username)


@pytest.mark.async_test
async def test_admin_user_add_admin_role(browser):
    await login_admin(browser)
    extra_username, extra_pw = extra_users[1]

    await browser.click(f'#user-roles\\${extra_username} .drop-symbol')
    await browser.click(f'#user-roles\\${extra_username} '
                        '.dropdown-item:nth-child(1)')

    await logout(browser)
    await login_user(browser, extra_username, extra_pw)
    await browser.get(admin_url)
    await browser.wait_for_text_to_equal(
        '#admin-page > div:nth-child(2) .dazzler-core-text',
        ' User Administration'
    )


@pytest.mark.async_test
async def test_admin_user_delete(browser):
    await login_admin(browser)

    extra_username, extra_pw = extra_users[1]

    await browser.click(f'#delete\\${extra_username}')
    await browser.click('#confirm-delete-user-button')

    await logout(browser)
    await login_user(browser, extra_username, extra_pw)
    await browser.wait_for_text_to_equal(
        '#login-error', 'Invalid credentials'
    )


@pytest.mark.async_test
async def test_admin_create_delete_role(browser):
    await login_admin(browser)

    extra_username, _ = extra_users[5]

    await browser.click('.dazzler-tabs .dazzler-tab:nth-child(2)')

    role_name_input = await browser.wait_for_element_by_id('new-role-name')
    role_name_input.send_keys('new_role')

    await browser.click('#new-role-button')

    await browser.click('.dazzler-tabs .dazzler-tab:nth-child(1)')
    await browser.click(f'#user-roles\\${extra_username} .drop-symbol')
    await browser.click(f'#user-roles\\${extra_username} '
                        '.dropdown-item:nth-child(3)')

    await browser.wait_for_text_to_equal(
        f'#user-roles\\${extra_username} .selected-items '
        '.drop-selected-item:nth-child(2) .selected-label', 'new_role'
    )

    await browser.click('.dazzler-tabs .dazzler-tab:nth-child(2)')
    await browser.click('#remove-role\\$new_role')

    await browser.click('.dazzler-tabs .dazzler-tab:nth-child(1)')

    roles = await browser.wait_for_elements_by_css_selector(
        f'#user-roles\\${extra_username} .selected-items'
    )
    assert len(roles) == 1
