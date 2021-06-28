import asyncio

from dazzler.components import core
from dazzler.system import Page, BindingContext

page = Page(
    __name__,
    core.Container(
        [
            core.Button('Start', identity='start-btn', preset='primary'),
            core.ProgressBar(
                identity='progress',
                value=0,
                style={'width': '100px'}
            )
        ],
        class_name='row',
        style={'padding': '1rem'}
    )
)


@page.bind('clicks@start-btn')
async def on_start(ctx: BindingContext):

    async def long_running():
        for i in range(0, 101):
            await asyncio.sleep(0.1)
            await ctx.set_aspect('progress', value=i)

    await ctx.set_aspect('start-btn', disabled=True)

    ctx.create_task(long_running())
