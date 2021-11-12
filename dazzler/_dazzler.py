import functools
import importlib
import itertools
import json
import shutil
import sys
import asyncio
import os
import typing

from concurrent.futures import ThreadPoolExecutor

import appdirs
import precept

from .events import DAZZLER_START, DAZZLER_STOP, DAZZLER_SETUP
from .system.auth import Authenticator, DazzlerAuth, AuthBackend
from .tools import get_member
from .system.session import (
    SessionMiddleware, FileSessionBackEnd
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
from .contrib import redis, postgresql
from .electron import (
    ElectronBuilder, run_electron, is_compiled, ELECTRON_TARGETS
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

        - ``dazzler --application app``, start an application.
        - ``dazzler generate path/to/components output_dir``
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
    auth: typing.Optional[DazzlerAuth]

    def __init__(self, module_name, app_name=None):
        module = importlib.import_module(module_name)
        self.module_file = module.__file__
        self.module_name = module_name
        self.root_path = os.path.dirname(module.__file__)
        self.app_name = app_name or \
            os.path.basename(module.__file__).split('.py')[0]

        config_file = [
            'dazzler.toml',
            os.path.join(self.root_path, 'dazzler.toml')
        ]

        if is_compiled():
            # Compiled version (electron) will get the configs from
            # the assets folder.
            config_file = [os.path.join(assets_path, 'dazzler.toml')]

        super().__init__(
            config_file=config_file,
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
        self.auth = None

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
            module = importlib.import_module(application or 'app')

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

        await self.events.dispatch(DAZZLER_SETUP, application=self)

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
                Route(
                    page.url,
                    functools.partial(
                        self.server.route_call, page=page
                    ),
                    name=f'{page.name}-call',
                    method=RouteMethod.PATCH,
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

        # Since start is not the entrypoint, we need to call _on_parse
        await self._on_parse(self.cli.parser.parse_args([]))

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
            if file in requirement.internal:
                return requirement
        return None

    @staticmethod
    def get_packages() -> typing.List[Package]:
        return Package.package_registry.values()

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
        precept.Argument(
            '--ts',
            help='Typescript support',
            action='store_true'
        ),
        precept.Argument(
            '--meta',
            help='Output the meta as json, no component is generated.',
            action='store_true',
        ),
        description='Generate dazzler components output'
    )
    async def generate(self, source_directory, output_dir, ts, meta):
        os.makedirs(output_dir, exist_ok=True)
        metadata = await generate_meta(source_directory, ts)
        if meta:
            with open(os.path.join(output_dir, 'meta.json'), 'w') as f:
                json.dump(metadata, f)
        else:
            await generate_components(metadata, output_dir, self.executor)

    @precept.Command(
        precept.Argument('-p', '--packages', nargs='+'),
        description='Copy the application requirements.'
    )
    async def copy_requirements(self, packages=tuple()):
        self.logger.debug('Copying requirements.')

        req_dir = self.config.requirements.static_directory \
            or self.requirements_dir

        if not os.path.exists(req_dir):
            os.makedirs(req_dir)

        if self.config.requirements.clean_directory:
            shutil.rmtree(req_dir, ignore_errors=True)
        os.makedirs(req_dir, exist_ok=True)

        for package in packages:
            self.logger.debug(f'Importing package: {package}')
            importlib.import_module(package)

        futures = []

        for requirement in self.collect_requirements():
            if not requirement.internal:
                continue
            destination = os.path.join(
                req_dir, requirement.internal_static
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

        # Copy the mount script.
        futures.append(
            self.executor.execute(
                shutil.copy,
                os.path.join(assets_path, 'index.js'),
                req_dir
            )
        )
        await asyncio.gather(*futures)

    @precept.Command(
        precept.Argument('app'),
        description='Run the electron app locally in development.'
                    'Make sure electron is installed on your path!'
    )
    async def electron(self, app):
        await run_electron(self, app)

    @precept.Command(
        precept.Argument('app'),
        precept.Argument(
            '--target',
            choices=ELECTRON_TARGETS,
            default='dir'
        ),
        precept.Argument('-o', '--output', default='electron'),
        precept.Argument('-p', '--publish', action='store_true'),
        precept.Argument('-c', '--clean', action='store_true'),
        precept.Argument('-e', '--remove-error', action='store_true'),
        description='Build the application for electron.'
    )
    async def electron_build(
        self, app, target, output, publish, clean, remove_error,
    ):
        builder = ElectronBuilder(self, app, target, output, publish)

        try:
            if clean:
                builder.cleanup()
            await builder.build()
        except Exception as error:  # pylint: disable=broad-except
            self.logger.exception(error)
            if remove_error:
                builder.cleanup()
            sys.exit(-1)

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
        self.logger.debug(f'Files changed {filenames}')
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
            elif filename.endswith('assets.json'):
                refresh = True

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
            [r.prepare() for r in files],
            hot,
            refresh,
            [r.prepare() for r in deleted_files]
        )
        return hot

    async def _on_startup(self, _):
        await self.events.dispatch(DAZZLER_START, application=self)

    async def _on_shutdown(self, _):
        self.stop_event.set()
        await self.events.dispatch(DAZZLER_STOP, application=self)

    async def _enable_auth(self):
        self.logger.debug('Enabling authentication system')
        backend = None

        if self.config.authentication.authenticator:
            authenticator = get_member(
                self.config.authentication.authenticator
            )
            if isinstance(authenticator, type):
                authenticator = authenticator(self)

            if not isinstance(authenticator, Authenticator):
                raise AuthError(
                    f'{self.config.authentication.authenticator} '
                    f'is not an instance of '
                    f'`dazzler.system.auth:Authenticator` '
                    f'{repr(authenticator)}'
                )
        else:
            raise AuthError(
                'Set config.authentication.authenticator to a subclass of'
                'dazzler.system.auth:Authenticator, '
                'eg: dazzler.contrib.postgresql.PostgresAuthenticator'
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

        if self.config.authentication.admin.enable:
            if not self.config.authentication.admin.page_ref:
                raise AuthError(
                    'authentication.admin.page_ref must be set '
                    'to use the admin page!'
                )
            admin_page_cls = get_member(
                self.config.authentication.admin.page_ref
            )
            admin_page = admin_page_cls(
                self,
                name=self.config.authentication.admin.page_name,
                url=self.config.authentication.admin.page_url,
                title=self.config.authentication.admin.page_title,
                authorizations=self.config.authentication.admin.authorizations,
            )
            self.add_page(admin_page)

        self.auth = DazzlerAuth(
            self, authenticator,
            backend=backend,
            default_redirect=self.config.authentication.login.default_redirect
        )

    async def _enable_session(self):
        if self.config.session.backend == 'File':
            backend = FileSessionBackEnd(self)
        elif self.config.session.backend == 'Redis':
            _redis = None
            # Automatically add a middleware if missing.
            if not any(
                isinstance(x, redis.RedisMiddleware)
                for x in self.middlewares
            ):
                _redis = await redis.get_redis_pool()
                self.middlewares.append(
                    redis.RedisMiddleware(self, _redis))
            backend = redis.RedisSessionBackend(self, _redis)
        elif self.config.session.backend == 'PostgreSQL':
            pool = None
            pg_config = postgresql.PostgresConfig()
            if os.path.exists(self.config_path):
                pg_config.read_file(self.config_path)

            if not any(
                isinstance(x, postgresql.PostgresMiddleware)
                for x in self.middlewares
            ):
                pool = await postgresql.get_postgres_pool(pg_config)
                self.middlewares.append(
                    postgresql.PostgresMiddleware(self, pg_config, pool=pool))
            backend = postgresql.PostgresSessionBackend(
                self, pg_config, pool
            )
        else:
            raise SessionError(
                'No valid session backend defined.\n',
                'Please choose from "File", "Redis", "PostgreSQL"'
            )

        self.middlewares.insert(
            0, SessionMiddleware(self, backend=backend)
        )

    async def _handle_configs(self):
        # Gather pages in the pages directory
        # FIXME pages_directory support for electron
        if os.path.exists(self.config.pages_directory) and not is_compiled():
            self.logger.debug(
                f'Adding pages from : {self.config.pages_directory}'
            )
            for page_path in os.listdir(self.config.pages_directory):
                if page_path.endswith('.py'):
                    name = page_path.split('.py')[0]

                    module_name = '.'.join(
                        itertools.chain(
                            self.config.pages_directory.split(os.path.sep),
                            [name]
                        )
                    )

                    page_mod = importlib.import_module(module_name)

                    for instance in vars(page_mod).values():
                        if isinstance(instance, Page):
                            self.logger.debug(
                                f'Adding page: {instance.name} from ' +
                                os.path.join(
                                    self.config.pages_directory, page_path
                                )
                            )
                            self.add_page(instance)

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
            await self._enable_session()

        if self.config.authentication.enable:
            await self._enable_auth()


def cli():
    dazzler = Dazzler('__main__')
    dazzler.start()
