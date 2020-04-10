# Dazzler

[![Build](https://img.shields.io/circleci/build/github/T4rk1n/dazzler/master)](https://circleci.com/gh/T4rk1n/dazzler)
[![Documentation Status](https://readthedocs.org/projects/dazzler/badge/?version=latest)](https://dazzler.readthedocs.io/en/latest/?badge=latest)
[![Version](https://img.shields.io/pypi/v/dazzler)](https://pypi.org/project/dazzler/)
[![License](https://img.shields.io/pypi/l/dazzler)](LICENSE)

Dazzler is a Python (>=3.6) async web framework. 
Create dazzling fast pages with a layout of python components and bindings to update from the backend.

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

## Basic example

Create a page with a layout and assign a binding to set the output component
children when clicked on.

```python
from dazzler import Dazzler
from dazzler.system import Page, Trigger, BindingContext
from dazzler.components import core

app = Dazzler(__name__)
page = Page(
    'my-page',
    core.Container([
        core.Html('H2', 'My dazzler page'),
        core.Input(identity='input', placeholder='Enter name'),
        core.Button('Click me', identity='click-me'),
        core.Container(identity='output')
    ])
)
app.add_page(page)


@page.bind(Trigger('click-me', 'clicks'))
async def on_click(context: BindingContext):
    name = await context.get_aspect('input', 'value')
    await context.set_aspect(
        'output', children=f'Hello {name}'
    )


if __name__ == '__main__':
    app.start()
```

## Documentation

Full documentation hosted on [readthedocs](https://dazzler.readthedocs.io/en/latest/).

Get help for the command line tools: `$ dazzler --help`
