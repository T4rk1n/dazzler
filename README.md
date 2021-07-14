# Dazzler

[![Build](https://img.shields.io/circleci/build/github/T4rk1n/dazzler/master)](https://circleci.com/gh/T4rk1n/dazzler)
[![Documentation Status](https://readthedocs.org/projects/dazzler/badge/?version=latest)](https://dazzler.readthedocs.io/en/latest/?badge=latest)
[![Version](https://img.shields.io/pypi/v/dazzler)](https://pypi.org/project/dazzler/)
[![License](https://img.shields.io/pypi/l/dazzler)](LICENSE)

Dazzler is a Python async web framework built with [aiohttp](https://github.com/aio-libs/aiohttp).
Create dazzling fast pages with a layout of Python components and bindings to update from the backend.

## Install

Install with pip: `$ pip install dazzler`

## Features

- Fast WebSocket based communication, deliver updates in realtime to thousands of connected clients at once.
- Lightweight bundles for fast initial page load.
- Support for third party integrations via middlewares.
- Session & authentication systems.
- No HTML/CSS/JS knowledge required, write everything with Python.
- Multi page based.
- Hot reload.
- Tons of components.
- Tie & Transform API to perform updates on the client side.

## Basic example

Create a page with a layout and assign bindings to save & load a visitor name 
with the session system. The button to save the visitor name is disabled if
no input value via tie & transform.

```python
from dazzler import Dazzler
from dazzler.system import Page, BindingContext, transforms as t
from dazzler.components import core

app = Dazzler(__name__)
page = Page(
    __name__,
    core.Container([
        core.Html('H2', 'My dazzler page'),
        core.Container('Please enter a name', identity='visitor-name'),
        core.Input(value='', identity='input'),
        core.Button('Save name', identity='save-btn', disabled=True),
    ], identity='layout', id='layout'),
    title='My Page',
    url='/'
)

# UI updates via tie & transforms
page.tie('value@input', 'disabled@save-btn').transform(
    t.Length().t(t.Lesser(1))
)


# Bindings executes on the server via websockets.
@page.bind('clicks@save-btn')
async def on_click(context: BindingContext):
    # Save the visitor name via session system
    name = await context.get_aspect('input', 'value')
    await context.session.set('visitor', name)
    await context.set_aspect(
        'visitor-name', children=f'Saved {name}'
    )


# Aspects defined on the layout trigger on initial render and
# allows to insert initial data.
@page.bind('id@layout')
async def on_layout(context: BindingContext):
    visitor = await context.session.get('visitor')
    if visitor:
        await context.set_aspect(
            'visitor-name', children=f'Welcome back {visitor}!'
        )


app.add_page(page)

if __name__ == '__main__':
    app.start()
```

## Documentation

Full documentation hosted on [readthedocs](https://dazzler.readthedocs.io/en/latest/).

Get help for the command line tools: `$ dazzler --help`
