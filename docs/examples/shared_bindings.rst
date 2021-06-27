.. shared_bindings:

Shared Bindings
---------------

Since each page contains it's own bindings, If you need to reuse parts of
layout with their own handlers, you can put the bindings in a list and
copy it on each pages.

Example with an header included on two pages
============================================

.. code-block:: python
    :caption: header.py

    from dazzler.components import core
    from dazzler.system import Binding, Trigger

    def header(title):
        return core.Container([
            core.Html(2),
            core.Button('Shared click', identity='shared-btn'),
            core.Container(identity='shared-output', class_name='row')
        ], class_name='row')


    async def on_load(ctx):
        shared_clicks = await ctx.session.get('shared_clicks')
        await ctx.set_aspect('shared-output', children=shared_clicks)

    async def on_click(ctx):
        shared_clicks = await ctx.session.get('shared_clicks')
        shared_clicks += 1
        await ctx.session.set('shared_clicks', shared_clicks)
        await ctx.set_aspect('shared-output', children=shared_clicks)

    # Since there is no page yet, we can store the bindings
    # in a list and use the object based Binding wrapper.
    header_bindings = [
        Binding(Trigger('shared-output', 'class_name'))(on_load),
        Binding(Trigger('shared-btn', 'clicks'))(on_clicks)
    ]

.. code-block:: python
    :caption: page1.py

    from dazzler.components import core
    from dazzler.system import Page

    from .header import header, header_bindings

    page = Page(
        __name__,
        core.Container([
            header('Page 1'),
            core.Container('page one content')
        ]),
        # It is important to copy the list.
        # Other it will be shared across pages and all bindings
        # will be added to the same list.
        bindings=header_bindings.copy()
    )

Repeat for any page where you want the header included.
