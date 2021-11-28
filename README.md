# Dazzler

[![Build](https://img.shields.io/circleci/build/github/T4rk1n/dazzler/master)](https://circleci.com/gh/T4rk1n/dazzler)
[![Documentation Status](https://readthedocs.org/projects/dazzler/badge/?version=latest)](https://dazzler.readthedocs.io/en/latest/?badge=latest)
[![Version](https://img.shields.io/pypi/v/dazzler)](https://pypi.org/project/dazzler/)
[![License](https://img.shields.io/pypi/l/dazzler)](LICENSE)

Dazzler is a hybrid UI framework for Python to create Desktop or Web Applications.

Built with [Aiohttp](https://github.com/aio-libs/aiohttp), [React](https://github.com/facebook/react) and [Electron](https://github.com/electron/electron).

## Install

Install with pip: `$ pip install dazzler`

## Features

- Fast WebSocket based communication, deliver updates in realtime to thousands of connected clients at once.
- Build desktop applications with Electron.
- Support for third party integrations via middlewares.
- Session & authentication systems.
- Tie & Transform API to perform updates on the client side.

## Quickstart

Quickstart with a GitHub template

- [dazzler-app-template](https://github.com/T4rk1n/dazzler-app-template)
- [dazzler-electron-template](https://github.com/T4rk1n/dazzler-electron-template)
- [dazzler-component-template](https://github.com/T4rk1n/dazzler-component-template)

## Example

Create a page with a layout and assign bindings to save & load a visitor name 
with the session system. The button to save the visitor name is disabled if
no input value via tie & transform.

```python
from dazzler import Dazzler
from dazzler.system import Page, BindingContext, CallContext, transforms as t
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
# `call` executes via regular requests.
@page.call('id@layout')
async def on_layout(context: CallContext):
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

Full documentation hosted on [readthedocs](https://dazzler.readthedocs.io/en/latest/usage.html).

Get help for the command line tools: `$ dazzler --help`
