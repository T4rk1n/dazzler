import argparse
import functools
import importlib
import itertools
import shutil
import sys
import asyncio
import os
import typing

from concurrent.futures import ThreadPoolExecutor

import precept

from .system.auth import Authenticator, DazzlerAuth, AuthBackend
from .tools import get_member
from .system.session import (
    SessionMiddleware, FileSessionBackEnd, RedisSessionBackend
)
from .system import (
    Package,
    generate_components,
    Requirement,
    Page,
    Middleware,
    Route,
    RouteMethod,
)

from ._config import DazzlerConfig
from ._server import Server
from ._version import __version__
from .errors import (
    PageConflictError, ServerStartedError, SessionError, AuthError
)
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
    config: DazzlerConfig
    config_class = DazzlerConfig
    version = __version__
    pages: typing.Dict[str, Page]
    global_arguments = [
        precept.Argument(
            '-a', '--application',
            help='Path to the application',
            type=str
        ),
    ]
    server: Server
    auth: DazzlerAuth

    def __init__(self, module_name, app_name=None):
        module = importlib.import_module(module_name)
        self.root_path = os.path.dirname(module.__file__)
        self.app_name = app_name or \
            os.path.basename(module.__file__).rstrip('.py')

        super().__init__(
            config_file=[
                'dazzler.toml',
                os.path.join(self.root_path, 'dazzler.toml')
            ],
            add_dump_config_command=True,
            executor=ThreadPoolExecutor(),
            print_version=False,
        )

        self.requirements: typing.List[Requirement] = []
        self.middlewares: typing.List[Middleware] = []
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

    # pylint: disable=arguments-differ
    async def main(
            self,
            application=None,
            blocking=True,
            debug=False,
            **kwargs
    ):
        if application:
            # When running from the command line need to insert the path.
            # Otherwise it will never find it.
            sys.path.insert(0, '.')
            mod_path, app_name = application.split(':')
            module = importlib.import_module(mod_path)
            app: Dazzler = getattr(module, app_name)
            # Set cli for arguments
            app.cli = self.cli
        else:
            app = self

        await app.setup_server(debug=debug or app.config.debug)

        await app.server.start(
            app.config.host, app.config.port,
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
        # Gather global requirements from configs.
        for external in itertools.chain(
                self.config.requirements.external_scripts,
                self.config.requirements.external_styles
        ):
            self.requirements.append(Requirement(external=external))

        for internal in itertools.chain(
                self.config.requirements.internal_scripts,
                self.config.requirements.internal_styles
        ):
            self.requirements.append(Requirement(internal=internal))

        if self.config.session.enable:

            if self.config.session.backend == 'File':
                backend = FileSessionBackEnd(self)
            elif self.config.session.backend == 'Redis':
                backend = RedisSessionBackend(self)
            else:
                raise SessionError(
                    'No valid session backend defined.\n',
                    'Please choose from "File" or "Redis"'
                )

            self.middlewares.insert(
                0, SessionMiddleware(self, backend=backend)
            )

        if self.config.authentication.enable:
            await self._enable_auth()

        # Copy all requirements to make sure all is latest.
        await self.copy_requirements()

        # Remove the renderer from package_list once copied.
        # Served by default by the index.
        if 'dazzler_renderer' in Package.package_registry:
            Package.package_registry.pop('dazzler_renderer')

        await self.events.dispatch('dazzler_setup', application=self)

        # Add package defined routes
        routes = [x.routes for x in Package.package_registry.values()]

        # Add page specifics routes
        for page in self.pages.values():
            # Pages are not prefixed
            # noinspection PyTypeChecker
            routes += [[
                Route(
                    page.url,
                    functools.partial(self.server.route_page, page=page),
                    name=page.name,
                ),
                Route(
                    page.url,
                    functools.partial(self.server.route_page_json, page=page),
                    name=f'{page.name}-api',
                    method=RouteMethod.POST,
                ),
                Route(
                    f'{page.url}/ws',
                    functools.partial(self.server.route_update, page=page),
                    name=f'{page.name}-ws',
                    method=RouteMethod.GET,
                ),
            ]]
            routes += [page.routes]

        self.server.setup_routes(
            list(itertools.chain(*routes)),
            debug=debug,
        )

        self._prepared = True
        self.server.app.on_startup.append(self._on_startup)
        self.server.app.on_shutdown.append(self._on_shutdown)

    async def application(self):
        """Call for wsgi application"""
        if not self._prepared:
            await self.setup_server()
        return self.server.app

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
        description='Generate dazzler components from react-docgen output'
    )
    async def generate(self, metadata, output_dir):
        os.makedirs(output_dir, exist_ok=True)
        await generate_components(metadata, output_dir, self.executor)

    @precept.Command(
        precept.Argument('-p', '--packages', nargs='+'),
        description='Copy the application requirements.'
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
            if not requirement.internal:
                continue
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

    async def _on_startup(self, _):
        await self.events.dispatch('dazzler_start', application=self)

    async def _on_shutdown(self, _):
        await self.events.dispatch('dazzler_stop', application=self)

    async def _enable_auth(self):
        self.logger.debug('Enabling authentication system')
        backend = None

        if self.config.authentication.authenticator:
            authenticator = get_member(
                self.config.authentication.authenticator
            )
            if isinstance(authenticator, type):
                authenticator = authenticator()

            if not isinstance(authenticator, Authenticator):
                raise AuthError(
                    f'{self.config.authentication.authenticator} '
                    f'is not an instance of '
                    f'`dazzler.system.auth.Authenticator`'
                    f'{repr(authenticator)}'
                )
        else:
            raise AuthError(
                'No authenticator provided in config'
            )

        if self.config.authentication.backend:
            backend = get_member(
                self.config.authentication.backend,
            )
            if isinstance(backend, type):
                backend = backend()

            if not isinstance(backend, AuthBackend):
                raise AuthError(
                    f'{self.config.authentication.backend} '
                    f'is not an instance of '
                    f'`dazzler.system.auth.AuthBackend`'
                )

        self.auth = DazzlerAuth(self, authenticator, backend=backend)


def cli():
    dazzler = Dazzler('__main__')
    dazzler.start()
