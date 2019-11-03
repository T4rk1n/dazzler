import asyncio
import os
import pkgutil
import sys
from ssl import SSLContext
from typing import Optional, List
import weakref

import aiohttp

from aiohttp import web, WSCloseCode

from .system import Page, UNDEFINED, Route

from .tools import replace_all, format_tag
from ._renderer import package as renderer


class Server:
    """
    Dazzler server

    :Routes:

        - ``/dazzler/update``
        - ``/dazzler/requirements/``

    """
    runner: web.AppRunner
    loop: asyncio.AbstractEventLoop
    app: web.Application
    site: Optional[web.TCPSite]

    def __init__(self, dazzler, loop=None, app: web.Application = None):
        """
        :param dazzler: Dazzler instance.
        :type dazzler: dazzler.Dazzler
        :param loop: Asyncio event loop.
        :param app: An existing aiohttp web application to use.
        """
        self.dazzler = dazzler
        self.loop = loop or asyncio.get_event_loop()
        self.app = app or web.Application()
        self.index = pkgutil.get_data(
            'dazzler', os.path.join('assets', 'index.html')
        ).decode()
        self.logger = self.dazzler.logger
        self.websockets = weakref.WeakSet()
        self.debug = False
        self.site = None

    def setup_routes(self, routes: List[Route] = None, debug: bool = False):
        """
        Setup routes for dazzler.

        :param routes: Routes to add the server.
        :param debug: Set debug mode.
        :return:
        """
        routes = routes or []
        prefix = self.dazzler.config.route_prefix
        self.debug = debug

        # Dazzler api.
        self.app.add_routes([
            web.get(
                f'{prefix}/dazzler/link',
                self._apply_middleware(self.route_get_page)
            )
        ] + [
            x.method.get_method()(
                x.path, self._apply_middleware(x.handler), name=x.name
            )
            for x in routes
        ])

        # User static directory.
        static_dir = os.path.join(
            self.dazzler.root_path, self.dazzler.config.static_folder
        )
        if os.path.exists(static_dir):
            self.app.router.add_static(
                f'{prefix}{self.dazzler.config.static_prefix}',
                static_dir
            )

        # Main internal static directory where requirements are copied.
        self.app.router.add_static(
            f'{prefix}/dazzler/requirements/static',
            self.dazzler.requirements_dir,
        )

    async def route_update(self, request: web.Request, page: Page):
        """
        WebSocket route for aspect updating.

        :param request: The incoming request.
        :param page: The incoming page.
        :return:
        """
        ws = web.WebSocketResponse()

        await ws.prepare(request)

        self.websockets.add(ws)

        request_queue = asyncio.Queue()
        pendings = []
        aspect_requests = {}
        storage_requests = {}
        done = asyncio.Event()

        async def request_loop():
            while not done.is_set():
                req = await request_queue.get()
                kind = req['kind']
                if kind == 'get-aspect':
                    aspect_requests[req['request_id']] = req.pop('queue')
                elif kind == 'get-storage':
                    storage_requests[req['request_id']] = req.pop('queue')
                await ws.send_json(req)

        def done_callback(done: asyncio.Task):
            pendings.remove(done)
            exception = done.exception()
            if exception and not done.cancelled():
                done.print_stack(file=sys.stderr)
                self.logger.error(exception)

        async def handler():
            async for msg in ws:  # type: aiohttp.WSMessage
                if msg.type == aiohttp.WSMsgType.TEXT:
                    # noinspection PyNoneFunctionAssignment
                    data = msg.json()
                    kind = data.get('kind')

                    if kind == 'binding':
                        binding = page.get_binding(data['key'])

                        task = self.loop.create_task(
                            binding(request, data, ws, request_queue)
                        )
                        pendings.append(task)
                        task.add_done_callback(done_callback)

                    elif kind == 'get-aspect':
                        request_id = data['request_id']
                        value = data.get('value', UNDEFINED)
                        req = aspect_requests.pop(request_id)

                        if value is UNDEFINED:
                            await req.put((UNDEFINED, data.get('error')))
                        else:
                            await req.put((value, UNDEFINED))

                    elif kind == 'get-storage':
                        request_id = data['request_id']
                        value = data.get('value', UNDEFINED)
                        queue = storage_requests.pop(request_id)
                        await queue.put((value, UNDEFINED))
                else:
                    self.logger.debug(f'No handler for msg type: {msg.type}')

            done.set()

        async def pong():
            while not done.is_set():
                await asyncio.sleep(self.dazzler.config.renderer.ping_interval)
                await ws.send_json({'kind': 'ping'})

        try:
            ops = [handler(), request_loop()]
            if self.dazzler.config.renderer.ping:
                ops.append(pong())
            await asyncio.gather(*ops)
        finally:
            for pending in pendings:
                pending.cancel()
            self.websockets.discard(ws)

        return ws

    async def route_page(self, _: web.Request, page: Page = None):
        """
        Index route for a page.

        :param _:
        :param page: The page to serve.
        :return:
        """
        script = {
            'src': '/dazzler/requirements/static/index.js',
            'data-retries': str(self.dazzler.config.renderer.retries),
            'id': 'dazzler-script'
        }
        if self.dazzler.config.renderer.ping:
            script.update({
                'data-ping': 'true',
                'data-ping-interval':
                    str(self.dazzler.config.renderer.ping_interval)
            })

        index = replace_all(
            self.index,
            page_title=page.title,
            renderer_scripts='\n'.join(
                x.tag(
                    dev=self.debug,
                    external=self.dazzler.config.requirements.prefer_external
                )
                for x in renderer.requirements if x.kind == 'js'
            ),
            css='\n'.join(
                x.tag(
                    dev=self.debug,
                    external=self.dazzler.config.requirements.prefer_external
                )
                for x in renderer.requirements if x.kind == 'css'
            ),
            dazzler_script=format_tag('script', script),
            meta='\n'.join(format_tag('meta', x) for x in page.meta_tags),
            favicon=format_tag(
                'link', {
                    'rel': 'icon',
                    'href': page.favicon,
                    'type': 'image/x-icon'
                }
            ) if page.favicon else '',
            header=page.header,
            footer=page.footer,
            lang=page.lang,
        )
        return web.Response(body=index, content_type='text/html')

    # noinspection PyMethodMayBeStatic
    async def route_page_json(self, request: web.Request, page: Page = None):
        """
        Serve the bindings and layout associated with page.

        :param request:
        :param page:
        :return:
        """
        prepared = await page.prepare(
            request,
            self.debug,
            external=self.dazzler.config.requirements.prefer_external
        )
        # Add global requirements first.
        prepared['requirements'] = [
            x.prepare(
                dev=self.debug,
                external=self.dazzler.config.requirements.prefer_external
            ) for x in self.dazzler.requirements
        ] + prepared['requirements']

        if self.dazzler.config.development.reload:
            # Reload mode needs the websocket even if no binding.
            prepared['reload'] = True

        return web.json_response(prepared)

    async def route_get_page(self, request: web.Request):
        page = request.query.get('page')
        if page in self.dazzler.pages:
            raise web.HTTPFound(location=request.app.router[page].url_for())
        raise web.HTTPNotFound()

    async def start(
            self, host: str, port: int,
            shutdown_timeout: float = 60.0,
            ssl_context: Optional[SSLContext] = None,
            backlog: int = 128,
            reuse_address: Optional[bool] = None,
            reuse_port: Optional[bool] = None,
    ):
        """
        Start the server

        :param host:
        :param port:
        :param shutdown_timeout:
        :param ssl_context:
        :param backlog:
        :param reuse_address:
        :param reuse_port:
        :return:
        """
        self.app.on_shutdown.append(self._on_shutdown)
        self.logger.debug('Starting server')
        self.runner = web.AppRunner(self.app)
        await self.runner.setup()
        self.site = web.TCPSite(
            self.runner, host, port,
            shutdown_timeout=shutdown_timeout,
            ssl_context=ssl_context, backlog=backlog,
            reuse_address=reuse_address, reuse_port=reuse_port
        )
        await self.site.start()
        self.logger.info(f'Started server http://{host}:{port}/')

    async def _on_shutdown(self, _):
        # Close all websocket's and stop the main loop
        self.dazzler.stop_event.set()
        for ws in set(self.websockets):
            await ws.close(code=WSCloseCode.GOING_AWAY,
                           message='Server shutdown')

    async def send_reload(self, filenames, hot, refresh, deleted):
        for ws in set(self.websockets):
            await ws.send_json({
                'kind': 'reload',
                'filenames': filenames,
                'hot': hot,
                'refresh': refresh,
                'deleted': deleted
            })

    def _apply_middleware(self, handler):
        if not self.dazzler.middlewares:
            return handler

        async def apply(request: web.Request, *args, **kwargs):

            callbacks = []
            for middleware in self.dazzler.middlewares:
                callback = await middleware(request)
                if callback:
                    callbacks.append(callback)

            response = await handler(request, *args, **kwargs)

            for callback in callbacks:
                await callback(response)

            return response

        return apply
