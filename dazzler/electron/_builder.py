import json
import os
import sys
import shutil
import pathlib
import asyncio
import importlib

from dazzler._assets import (
    electron_package_path, electron_path, assets_path, electron_preload_path
)
from dazzler.electron._loading import get_loading_options, build_loading_html
from dazzler.errors import ElectronBuildError
from dazzler.tools import OrderedSet, transform_dict_keys

LINUX_TARGETS = (
    'AppImage',
    'snap',
    'deb',
    'rpm',
    'freebsd',
    'pacman',
    'p5p',
    'apk',
    'tar.xy',
    'tar.lz',
    'tar.gz',
    'tar.bz2',
)

WINDOWS_TARGETS = (
    'NSIS',
    'AppX',
    'Squirrel.Windows',
    '7z',
    'zip',
)

MAC_TARGETS = (
    'DMG',
    'MAS',
    'PKG',
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
        self._workdir = pathlib.Path(output).absolute()
        self._workdir.mkdir(exist_ok=True)
        if sys.platform == 'win32':
            self._executable = 'server.exe'
        else:
            self._executable = 'server'

    async def build(self):
        self.logger.debug(f'Workdir: {self._workdir}')
        shutil.copy(electron_path, str(self._workdir))
        shutil.copy(electron_preload_path, str(self._workdir))
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

        package['devDependencies']['electron'] =\
            self.config.electron.builder.electron_version
        package['devDependencies']['electron-builder'] =\
            self.config.electron.builder.electron_builder_version

        if self.config.electron.builder.app_id:
            package['build']['appId'] = self.config.electron.builder.app_id

        if self.config.electron.builder.product_name:
            package['build']['productName'] = \
                self.config.electron.builder.product_name

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
            'preload-electron.js'
        ]
        package['build']['extraResources'] = \
            package['build']['extraResources'] + [
                self._executable,
                '.env'
            ]

        package['build']['asar'] = self.config.electron.asar

        if self.target != 'dir':
            self._create_target(package)

        if self.config.electron.icon:
            package['build']['icon'] = self.config.electron.icon

        if self.config.electron.loading_window.enabled:
            self._create_loading_window(package)

        with open(package_path, 'w') as f:
            json.dump(package, f, indent=2)

    def _create_loading_window(self, package):
        dest = self._workdir.joinpath('electron-loading.html')

        html_content = build_loading_html(self.config)
        with open(dest, 'w') as f:
            f.write(html_content)

        package['build']['files'].append('electron-loading.html')

        # Add the options as a json file
        options = get_loading_options(self.config)
        with open(self._workdir.joinpath('loading.json'), 'w') as f:
            json.dump(options, f)

        package['build']['files'].append('loading.json')

    # noinspection PyProtectedMember
    def _create_target(self, package):
        target_options = {}

        if self.config.electron.target.arch:
            target_options = {'arch': self.config.electron.target.arch}

        if self.config.electron.target.platform:
            platform = self.config.electron.target.platform
        elif self.target in LINUX_TARGETS:
            platform = 'linux'
        elif self.target in WINDOWS_TARGETS:
            platform = 'win'
        elif self.target in MAC_TARGETS:
            platform = 'mac'
        else:
            raise ElectronBuildError(f'Invalid target: {self.target}')

        package['build'][platform] = \
            {'target': [{'target': self.target, **target_options}],
             **transform_dict_keys(
                 self.config._data['electron']['target'][platform])
             }

        if self.config.electron.target.options_file:
            with open(self.config.electron.target.options_file) as f:
                options = json.load(f)
                package['build'][self.target] = {
                    **package['build'].get(self.target, {}),
                    **options
                }

    async def _electron_builder(self):
        if self.publish:
            command = 'dist'
        elif self.target == 'dir':
            command = 'pack'
        else:
            command = 'build'
        proc = await asyncio.create_subprocess_shell(
            f'npm run {command}', cwd=str(self._workdir)
        )
        await proc.communicate()
        code = await proc.wait()
        if code != 0:
            raise ElectronBuildError(
                f'{code}: Failed to build with "npm run {command}"'
            )

    def _create_environ(self):
        env = f'DAZZLER_PORT={self.config.port}\n' \
              f'DAZZLER_APP={self._executable}\n' \
              'DAZZLER_COMPILED=True'

        if self.config.electron.loading_window.enabled:
            # Always the same path when compiled.
            env += '\nDAZZLER_LOADING_WINDOW_FILE=electron-loading.html\n'
            env += 'DAZZLER_LOADING_WINDOW_OPTIONS=loading.json\n'

        env_path = self._workdir.joinpath('.env')

        self.logger.debug(f'Create .env file: \n{env}')

        with open(env_path, 'w') as f:
            f.write(env)

    def _create_publish(self, package):
        provider = self.config.electron.publish.provider

        # noinspection PyProtectedMember
        package['build']['publish'] = transform_dict_keys(
            self.config._data['electron']['publish'][provider])
        package['build']['publish']['provider'] = provider

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
        module_path = '.'.join(
            list(reversed([x.stem for x in self.app_path.parents if x.stem])) +
            [self.app_path.stem]
        )
        self.logger.debug(f'Module path: {module_path}')

        try:
            importlib.import_module(module_path)
        except ImportError as err:
            raise ElectronBuildError(
                f'Invalid module path: {module_path}') from err

        for package in self.app.get_packages():
            if package.name in (
                'dazzler_core', 'dazzler_extra', 'dazzler_auth',
                'dazzler_icons', 'dazzler_markdown', 'dazzler_calendar',
                'dazzler_renderer'
            ):
                continue
            for requirement in package.requirements:
                args.append(
                    f'--add-data={requirement.internal}'
                    f'{os.pathsep}{requirement.internal}')

        if self.app.config_path:
            # Put the config file in the assets path, when
            # compiled, dazzler will get the configs from there.
            args.append(
                f'--add-data={self.app.config_path}'
                f'{os.pathsep}{dest}'
            )

        PyInstaller.__main__.run(args)
