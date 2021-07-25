import json
import os
import sys
import tempfile
import shutil
import pathlib
import asyncio
import importlib

from dazzler._assets import electron_package_path, electron_path, assets_path
from dazzler.system import Package
from dazzler.tools import OrderedSet

LINUX_TARGETS = (
    'AppImage',
    'snap',
    'deb',
    'rpm',
    'freebsd',
    'pacman',
    'p5p',
    'apk',
    '7z',
    'zip',
    'tar.xy',
    'tar.lz',
    'tar.gz',
    'tar.bz2',
    'dir',
)

WINDOWS_TARGETS = (
    'NSIS',
    'AppX',
    'Squirrel.Windows',
    'dir'
)

MAC_TARGETS = (
    'DMG',
    'MAS',
    'PKG',
    'dir'
)

ELECTRON_TARGETS = tuple(
    OrderedSet(*(WINDOWS_TARGETS + MAC_TARGETS + LINUX_TARGETS))
)


class ElectronBuilder:
    def __init__(self,
                 app,
                 app_path: str,
                 target: str,
                 output=None,
                 publish: bool = False
                 ):
        """
        :param app:
        :type app: dazzler.Dazzler
        :param app_path:
        :param target:
        """
        self.app = app
        self.logger = app.logger
        self.config = app.config
        self.app_path = pathlib.Path(app_path)
        self.target = target
        self.publish = publish
        self.app_name = app_path.split('.py')[0]
        # Create a temporary directory to create the project files
        self._workdir = pathlib.Path(output or tempfile.mkdtemp()).absolute()
        self._workdir.mkdir(exist_ok=True)
        # TODO add extension for proper targets.
        if sys.platform == 'win32':
            self._executable = 'server.exe'
        else:
            self._executable = 'server'

    async def build(self):
        self.logger.debug(f'Workdir: {self._workdir}')
        shutil.copy(electron_path, str(self._workdir))
        self._freeze_app()
        self._create_environ()
        self._create_package_json()
        await self._install_deps()
        await self._electron_builder()

    def cleanup(self):
        self.logger.debug(f'Deleting build directory: {self._workdir}')
        shutil.rmtree(str(self._workdir))

    async def _install_deps(self):
        proc = await asyncio.create_subprocess_shell(
            'npm i', cwd=str(self._workdir)
        )
        await proc.communicate()

    def _create_package_json(self):
        package_path = self._workdir.joinpath('package.json')
        self.logger.debug(f'Creating package.json {package_path}')
        with open(electron_package_path) as f:
            package = json.load(f)

        package['name'] = self.config.electron.metadata.app_name
        package['description'] = self.config.electron.metadata.description
        package['homepage'] = self.config.electron.metadata.homepage
        package['license'] = self.config.electron.metadata.license
        package['author'] = {
            'name': self.config.electron.metadata.author.name,
            'email': self.config.electron.metadata.author.email,
        }
        package['version'] = self.config.version

        package['build']['appId'] = self.config.electron.builder.app_id
        if self.config.electron.builder.productName:
            package['build']['productName'] = \
                self.config.electron.builder.productName

        package['build']['copyright'] = self.config.electron.builder.copyright

        package['build']['target'] = self.target

        if self.config.electron.build_config_file:
            self.logger.debug(
                f'Merging config file {self.config.electron.build_config_file}'
            )
            with open(self.config.electron.build_config_file) as f:
                package['build'] = {**package['build'], **json.load(f)}

        package['build']['files'] = package['build']['files'] + [
            'electron-dazzler.js',
        ]
        package['build']['extraResources'] = \
            package['build']['extraResources'] + [
                self._executable,
                '.env'
            ]

        package['build']['asar'] = self.config.electron.asar

        if self.config.electron.icon:
            package['build']['icon'] = self.config.electron.icon

        if self.target in LINUX_TARGETS:
            if self.config.electron.linux_target.category:
                package['build']['category'] = \
                    self.config.electron.linux_target.category
            if self.config.electron.linux_target.maintainer:
                package['build']['maintainer'] = \
                    self.config.electron.linux_target.maintainer
            if self.config.electron.linux_target.vendor:
                package['build']['vendor'] = \
                    self.config.electron.linux_target.vendor
            if self.config.electron.linux_target.synopsis:
                package['build']['synopsis'] = \
                    self.config.electron.linux_target.synopsis

        with open(package_path, 'w') as f:
            json.dump(package, f, indent=2)

    async def _electron_builder(self):
        command = 'dist' if self.publish else 'build'
        proc = await asyncio.create_subprocess_shell(
            f'npm run {command}', cwd=str(self._workdir)
        )
        await proc.communicate()

    def _create_environ(self):
        env = f'DAZZLER_PORT={self.config.port}\n' \
              f'DAZZLER_APP={self._executable}\n' \
              f'DAZZLER_COMPILED=True'

        env_path = self._workdir.joinpath('.env')

        self.logger.debug(f'Create .env file: \n{env}')

        with open(env_path, 'w') as f:
            f.write(env)

    def _freeze_app(self):
        # Import it here not top level since it setup the logging
        # and that will enable the server logs clutter on stderr.
        import PyInstaller.__main__

        dest = os.path.join('dazzler', 'assets')

        args = [
            str(self.app_path),
            '--distpath',
            str(self._workdir),
            '--onefile',
            '--name=server',
            # Need to copy the assets path where they going or
            # else the path is wrong with _MEI stuff
            f'--add-data={assets_path}'
            f'{os.pathsep}{dest}',
        ]

        sys.path.insert(0, '.')
        # Import the app to load all packages.
        importlib.import_module(
            '.'.join(
                [x.stem for x in self.app_path.parents if x.stem] +
                [self.app_path.stem]
            )
        )

        for package_name, package in Package.package_registry.items():
            if package_name in (
                'dazzler_core', 'dazzler_extra', 'dazzler_auth',
                'dazzler_icons', 'dazzler_markdown', 'dazzler_calendar',
                'dazzler_renderer'
            ):
                continue
            for requirement in package.requirements:
                args.append(
                    f'--add-data={requirement.internal}'
                    f'{os.pathsep}{requirement.internal}')
                if requirement.dev:
                    args.append(
                        f'--add-data={requirement.dev}'
                        f'{os.pathsep}{requirement.dev}')

        if self.app.config_path:
            # Put the config file in the assets path, when
            # compiled, dazzler will get the configs from there.
            args.append(
                f'--add-data={self.app.config_path}'
                f'{os.pathsep}{dest}'
            )

        PyInstaller.__main__.run(args)
