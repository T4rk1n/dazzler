from datetime import datetime

from dazzler import Dazzler
from dazzler.components import core, calendar, extra
from dazzler.system import Page, BindingContext

app = Dazzler(__name__)
app.config.session.backend = 'Redis'

page = Page(__name__, core.Container([
    core.Container([], identity='app', class_name='app')
]), url='/')

app.add_page(page)

chat_layout = core.Container([
    core.ListBox(identity='messages'),
    core.Container(
        [
            core.TextArea(identity='msg-area'),
            core.Button(
                'Send',
                identity='send-btn',
                preset='primary',
                disabled=True,
                rounded=True,
                class_name='send-btn'
            )
        ],
        class_name='message-form row'
    )
])


def redis():
    # Redis is currently integrated with the session middleware
    # which is always the first middleware in the list for now.
    # Will be changed to a proper middleware & added to aiohttp app context
    return app.middlewares[0]._backend.redis


def create_message(msg):
    return extra.PopUp(
            [
                core.Html('span', msg['name'], class_name='msg-user'),
                core.Html('span', msg['body'], class_name='msg-body'),
            ],
            content=calendar.Timestamp(
                msg['ts'], format='[Sent at] DD/MM/YYYY HH[:]mm'
            ),
            class_name='msg'
        )


async def handle_messages(ctx: BindingContext):
    channel, = await redis().subscribe(
        f'chatter-{ctx.session.session_id}'
    )

    while await channel.wait_message():
        message = await channel.get_json()
        await ctx.set_aspect('messages', prepend=create_message(message))


@page.bind('class_name@app')
async def page_load(ctx: BindingContext):
    # Define if already supplied a username
    name = await ctx.session.get('name')

    if name:
        await ctx.set_aspect(
            'app', children=core.Container([
                core.Html('h2', f'Welcome back {name}'),
                chat_layout,
            ])
        )
        # Run the task in the background.
        # Task created with the context will be automatically cancelled
        # when the websocket connection dies.
        ctx.create_task(handle_messages(ctx))
    else:
        await ctx.set_aspect(
            'app', children=core.Container([
                core.Html('h2', 'Please enter a name to join the chat'),
                core.Input(identity='name-input', placeholder='Name'),
                core.Button('Join', identity='join-btn')
            ])
        )


@page.bind('value@msg-area', 'disabled@send-btn')
async def text_input(ctx: BindingContext):
    text_len = len(ctx.trigger.value)
    if ctx.states['send-btn']['disabled'] and text_len > 1:
        await ctx.set_aspect('send-btn', disabled=False)
    elif text_len < 1:
        await ctx.set_aspect('send-btn', disabled=True)


@page.bind('clicks@join-btn', 'value@name-input')
async def join_room(ctx: BindingContext):
    name = ctx.states['name-input']['value']
    await ctx.session.set('name', name)
    await ctx.set_aspect('app', children=chat_layout)
    ctx.create_task(
        handle_messages(ctx)
    )


@page.bind('clicks@send-btn', 'value@msg-area')
async def send_messages(ctx: BindingContext):
    channels = await redis().pubsub_channels(
        pattern='chatter-*'
    )
    name = await ctx.session.get('name')
    for channel in channels:
        await redis().publish_json(
            channel, {
                'body': ctx.states['msg-area']['value'],
                'name': name,
                'ts': datetime.utcnow().isoformat(),
            }
        )

    await ctx.set_aspect('msg-area', value='')


if __name__ == '__main__':
    app.start('--debug --reload --port 8189')
