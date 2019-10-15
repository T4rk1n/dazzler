"""
Page form of dazzler
Created 2019-07-14
"""
from aiohttp import web

from dazzler.components import core
from dazzler.system import Page, RouteMethod

page = Page(
    __name__,
    core.Container([
        core.Form(
            fields=[
                {
                    'label': 'Field 1',
                    'name': 'field1',
                    'type': 'text'
                },
            ],
            action='/submit-form',
            method='post',
            identity='form'
        )
    ])
)


@page.route('/submit-form', method=RouteMethod.POST, prefix=False)
async def submit(request: web.Request):
    data = await request.post()
    return web.Response(
        body=f'<div id="output">{data.get("field1")}</div>',
        content_type='text/html'
    )
