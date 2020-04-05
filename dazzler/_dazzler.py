import functools
import importlib
import itertools
import shutil
import sys
import asyncio
import os
import typing

from concurrent.futures import ThreadPoolExecutor

import appdirs
import precept

from .system.auth import Authenticator, DazzlerAuth, AuthBackend
from .tools import get_member
from .system.session import (
    SessionMiddleware, FileSessionBackEnd, RedisSessionBackend
)
from .system import (
    Package,
    generate_components,
    generate_meta,
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
    PageConflictError, ServerStartedError, SessionError, AuthError,
    NoInstanceFoundError
)
from ._assets import assets_path
from ._reloader import start_reloader


class Dazzler(precept.Precept):  # pylint: disable=too-many-instance-attributes
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
        precept.Argument(
            '--reloaded',
            action='store_true'
        ),
    ]
    server: Server
    auth: DazzlerAuth

    def __init__(self, module_name, app_name=None):
        module = importlib.import_module(module_name)
        self.module_file = module.__file__
        self.module_name = module_name
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
        self.data_dir = os.path.join(
            appdirs.user_data_dir('dazzler'), self.app_name
        )
        self.requirements_dir = os.path.join(self.data_dir, 'requirements')

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
        if self.server.site:
            await self.server.site.stop()
        self.stop_event.set()

    # pylint: disable=arguments-differ
    async def main(
            self,
            application=None,
            blocking=True,
            debug=False,
            reload=False,
            reloaded=False,
            start_event=None,
            **kwargs
    ):
        if application:
            # When running from the command line need to insert the path.
            # Otherwise it will never find it.
            sys.path.insert(0, '.')
            module = importlib.import_module(application)

            app: typing.Optional[Dazzler] = None

            # Search for instance so you don't have to supply a name
            # with weird syntax.
            for instance in vars(module).values():
                if isinstance(instance, Dazzler):
                    app: Dazzler = instance

            if app is None:
                raise NoInstanceFoundError(
                    f'No dazzler application found in {application}'
                )

            # Set cli for arguments
            app.cli = self.cli
            await app._on_parse(self._args)
        else:
            app = self

        reloader = None

        if reload:
            app.config.development.reload = True
            reloader = self.loop.create_task(
                start_reloader(app, reloaded, start_event)
            )

        if not reload or (reload and reloaded):
            if debug:
                app.config.debug = debug
            await app.setup_server(debug=app.config.debug)

            await app.server.start(
                app.config.host, app.config.port,
            )

        # Test needs it to run without loop
        # Otherwise the server closes when the event loop ends.
        if blocking and not reloader:
            await self._loop()
        elif blocking and reloader:
            await reloader

    async def _loop(self):
        while not self.stop_event.is_set():
            # Just run so the site doesn't close.
            # Maybe add something later here.
            await asyncio.sleep(100)

    async def setup_server(self, debug=False):
        await self._handle_configs()

        # Copy all requirements to make sure all is latest.
        await self.copy_requirements()

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
                    f'/{page.name}/ws',
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

    def collect_requirements(self) -> typing.Set[Requirement]:
        requirements = [
            package.requirements for package
            in Package.package_registry.values()
        ]
        requirements += [self.requirements]
        requirements += [
            page.requirements for page in self.pages.values()
        ]

        return set(itertools.chain(*requirements))

    def requirement_from_file(self, file) -> typing.Optional[Requirement]:
        for requirement in self.collect_requirements():
            if any(
                    file in r for r in (requirement.internal, requirement.dev)
                    if r
            ):
                return requirement
        return None

    def _remove_requirement(self, requirement: Requirement):
        # Remove from page requirement most probably
        for page in self.pages.values():
            if requirement in page.requirements:
                page.requirements.remove(requirement)
                return
        if requirement in self.requirements:
            self.requirements.remove(requirement)
            return
        for package in Package.package_registry.values():
            if requirement in package.requirements:
                package.requirements.remove(requirement)
                return

    # Commands

    @precept.Command(
        precept.Argument(
            'source_directory',
            help='Components source directory'
        ),
        precept.Argument(
            'output_dir',
            help='Output the components in this folder.'
        ),
        description='Generate dazzler components from react-docgen output'
    )
    async def generate(self, source_directory, output_dir):
        os.makedirs(output_dir, exist_ok=True)
        metadata = await generate_meta(source_directory)
        await generate_components(metadata, output_dir, self.executor)

    @precept.Command(
        precept.Argument('-p', '--packages', nargs='+'),
        description='Copy the application requirements.'
    )
    async def copy_requirements(self, packages=tuple()):
        self.logger.debug('Copying requirements.')

        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir)

        shutil.rmtree(self.requirements_dir, ignore_errors=True)
        os.makedirs(self.requirements_dir, exist_ok=True)

        for package in packages:
            self.logger.debug(f'Importing package: {package}')
            importlib.import_module(package)

        futures = []

        for requirement in self.collect_requirements():
            if not requirement.internal:
                continue
            destination = os.path.join(
                self.requirements_dir, requirement.internal_static
            )
            self.logger.debug(
                f'Copying {requirement.internal} '
                f'to {destination}'
            )
            os.makedirs(os.path.dirname(destination), exist_ok=True)
            futures.append(self.executor.execute(
                shutil.copy,
                requirement.internal,
                destination,
            ))
            if requirement.dev:
                destination = os.path.join(
                    self.requirements_dir, requirement.dev_static
                )
                self.logger.debug(
                    f'Copying {requirement.dev} '
                    f'to {destination}'
                )
                os.makedirs(os.path.dirname(destination), exist_ok=True)
                futures.append(
                    self.executor.execute(
                        shutil.copy,
                        requirement.dev,
                        destination,
                    )
                )

        # Copy the mount script.
        futures.append(
            self.executor.execute(
                shutil.copy,
                os.path.join(assets_path, 'index.js'),
                self.requirements_dir
            )
        )
        await asyncio.gather(*futures)

    # Handlers

    async def on_file_change(
            self,
            filenames: typing.List[str],
            deleted: typing.List[str]
    ):
        hot = False  # Restart the server & Reload the page api/layout.
        refresh = False  # Refresh the page because the root bundles changed.
        files = set()
        deleted_files = set()
        for filename in filenames:
            if filename.endswith('.py'):
                hot = True
            elif filename.endswith('.js') or filename.endswith('.css'):
                if 'dazzler_renderer' in filename:
                    refresh = True
                requirement = self.requirement_from_file(filename)
                if requirement:
                    files.add(requirement)
                else:
                    requirement = Requirement(internal=filename)
                    files.add(requirement)
                    self.requirements.append(requirement)

        for removed in deleted:
            requirement = self.requirement_from_file(removed)
            if removed.endswith('.js'):
                refresh = True
            if requirement:
                self._remove_requirement(requirement)
                deleted_files.add(requirement)

        if not hot:
            await self.copy_requirements()
        await self.server.send_reload(
            [r.prepare(dev=self.config.debug) for r in files],
            hot,
            refresh,
            [r.prepare(dev=self.config.debug) for r in deleted_files]
        )
        return hot

    async def _on_startup(self, _):
        await self.events.dispatch('dazzler_start', application=self)

    async def _on_shutdown(self, _):
        self.stop_event.set()
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

    async def _handle_configs(self):
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


def cli():
    dazzler = Dazzler('__main__')
    dazzler.start()
