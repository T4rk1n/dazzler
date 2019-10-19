"""
Page login of dazzler
Created 2019-09-20

Test app for the login/logout components of auth,
assume no integration only components logic.
"""
from aiohttp import web

from dazzler.components import core, auth
from dazzler.system import Page


async def layout(request: web.Request):
    user = request.cookies.get('logged-user')
    if user:
        return core.Container([
            core.Html('h1', f'Logged in as {user}', identity='login-label'),
            auth.Logout('/login/logout', identity='logout'),
        ])
    return core.Container([
        auth.Login(
            '/login/login-perform',
            method='post',
            identity='login-form',
            bordered=True,
            header=core.Html('h3', 'Please login', identity='login-label'),
        ),
    ])


page = Page(
    __name__,
    layout=layout,
)


@page.route('/login-perform', method='post')
async def on_login(request: web.Request):
    data = await request.post()

    next_url = data.get('next_url')
    username = data.get('username')
    password = data.get('password')

    if password == 'foobar':
        response = web.HTTPSeeOther(location=next_url)
        response.set_cookie('logged-user', username)
        return response

    raise web.HTTPFound(location=request.headers.get('Referer'))


@page.route('/logout', method='post')
async def on_logout(request: web.Request):
    data = await request.post()

    next_url = data.get('next_url')
    response = web.HTTPSeeOther(location=next_url)
    response.del_cookie('logged-user')

    return response
