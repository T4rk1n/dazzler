import argparse
import functools
import importlib
import itertools
import shutil
import sys
import asyncio
import os
import typing

import precept

from concurrent.futures import ThreadPoolExecutor
from aiohttp import web

from .system import Package, generate_components, Requirement, Page
from .tools import get_package_path

from ._config import DazzlerConfig
from ._server import Server
from ._version import __version__
from .errors import PageConflictError, ServerStartedError
from ._assets import assets_path
# noinspection PyProtectedMember
from .system._requirements import _internal_data_dir


class Dazzler(precept.Precept):
    """
    Dazzler web application & cli.

    :Commands:

        - ``dazzler --root application``, start an application.
        - ``dazzler generate components_metadata.json output_dir``
        - ``dazzler copy-requirements -p dazzler_core -p dazzler_extra``
    """
    config = DazzlerConfig()
    version = __version__
    pages: typing.Dict[str, Page]
    global_arguments = [
        precept.Argument('--root', help='Root module path')
    ]
    server: Server

    def __init__(self, module_name):
        self.root_path = get_package_path(module_name)
        super().__init__(
            config_file=[
                'dazzler.ini',
                os.path.join(self.root_path, 'dazzler.ini')
            ],
            add_dump_config_command=True,
            executor=ThreadPoolExecutor(),
        )
        self.requirements: typing.List[Requirement] = []
        self.server = Server(self, loop=self.loop)
        self.pages = {}
        self.stop_event = asyncio.Event()
        self._prepared = False
        self._started = False

    def add_page(self, *pages: Page):
        if self._started:
            raise ServerStartedError(
                f'Cannot add pages after the server started:'
                f' {",".join(str(x) for x in pages)}'
            )
        for page in pages:
            if page.name in self.pages:
                raise PageConflictError(f'Duplicate page name: {page}')
            for x in self.pages.values():
                if x.url == page.url:
                    raise PageConflictError(f'Duplicate page url: {page}')
            self.pages[page.name] = page

    async def stop(self):
        await self.server.site.stop()

    async def main(self, root=None, blocking=True, debug=False, **kwargs):
        # Not sure if should be a proper command instead.
        if root:
            self.root_path = get_package_path(root)

        await self.setup_server(debug=debug or self.config.debug)

        await self.server.start(
            self.config.host, self.config.port,
        )

        # Test needs it to run without loop
        # Otherwise the server closes when the event loop ends.
        if blocking:
            await self._loop()

    async def _loop(self):
        while not self.stop_event.is_set():
            # Just run so the site doesn't close.
            # Maybe add something later here.
            await asyncio.sleep(100)

    async def setup_server(self, debug=False):
        # Copy all requirements to make sure all is latest.
        await self.copy_requirements()

        # Remove the renderer from package_list once copied.
        # Served by default by the index.
        if 'dazzler_renderer' in Package.package_registry:
            Package.package_registry.pop('dazzler_renderer')

        # Add package defined routes
        routes = [x.routes for x in Package.package_registry.values()]

        # Add page specifics routes
        for page in self.pages.values():
            # Pages are not prefixed
            # noinspection PyTypeChecker
            routes += [[
                web.get(
                    page.url,
                    functools.partial(self.server.route_page, page=page),
                    name=page.name,
                ),
                web.post(
                    page.url,
                    functools.partial(self.server.route_page_json, page=page),
                    name=f'{page.name}-api'
                )
            ]]
            routes += [page.routes]

        self.server.setup_routes(
            list(itertools.chain(*routes)),
            debug=debug,
        )

        self._prepared = True

    # Commands

    @precept.Command(
        precept.Argument(
            'metadata',
            type=argparse.FileType('r'),
            default=sys.stdin,
            help='react-docgen output'
        ),
        precept.Argument(
            'output_dir',
            help='Output the components in this folder.'
        ),
        description='Generate the components from react-docgen output'
    )
    async def generate(self, metadata, output_dir):
        os.makedirs(output_dir, exist_ok=True)
        await generate_components(metadata, output_dir, self.executor)

    @precept.Command(
        precept.Argument('-p', '--packages', nargs='+')
    )
    async def copy_requirements(self, packages=tuple()):
        self.logger.debug('Copying requirements.')
        for package in packages:
            self.logger.debug(f'Importing package: {package}')
            importlib.import_module(package)

        futures = []

        requirements = [
            package.requirements for package
            in Package.package_registry.values()
        ]
        requirements += [self.requirements]
        requirements += [
            page.requirements for page in self.pages.values()
        ]

        for requirement in itertools.chain(*requirements):
            self.logger.debug(
                f'Copying {requirement.internal} '
                f'to {requirement.internal_static}'
            )
            futures.append(self.executor.execute(
                shutil.copy,
                requirement.internal,
                requirement.internal_static
            ))
            if requirement.dev:
                self.logger.debug(
                    f'Copying {requirement.dev} '
                    f'to {requirement.dev_static}'
                )
                futures.append(
                    self.executor.execute(
                        shutil.copy,
                        requirement.dev,
                        requirement.dev_static
                    )
                )

        # Copy the mount script.
        futures.append(
            self.executor.execute(
                shutil.copy,
                os.path.join(assets_path, 'index.js'),
                os.path.join(_internal_data_dir)
            )
        )
        await asyncio.gather(*futures)


def cli():
    dazzler = Dazzler('__main__')
    dazzler.start()


if __name__ == '__main__':
    cli()
