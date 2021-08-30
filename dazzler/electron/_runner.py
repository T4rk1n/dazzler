import json
import shlex
import asyncio
import shutil
import sys
import os
import tempfile

from dazzler._assets import electron_path, electron_preload_path
from ._loading import get_loading_options, build_loading_html
from ._runtime import is_compiled


async def run_electron(app, app_path: str):
    """
    :param app:
    :type  app: dazzler.Dazzler
    :param app_path:
    :return:
    """
    cmd = shlex.split(
        f'electron {electron_path}',
        posix=sys.platform != 'win32'
    )
    env = os.environ.copy()
    env['DAZZLER_PORT'] = str(app.config.port)
    env['DAZZLER_APP'] = app_path
    env['DAZZLER_COMPILED'] = str(is_compiled())
    env['DAZZLER_PRELOAD'] = electron_preload_path
    options_dir = tempfile.mkdtemp('dazzler')

    if app.config.electron.loading_window.enabled:
        options = get_loading_options(app.config)
        options_file = 'loading-options.json'

        app.logger.debug(
            f'Create options for loading windows at {options_file}'
        )
        app.logger.debug(f'Loading window options: {options}')
        os.makedirs(options_dir, exist_ok=True)

        with open(options_file, 'w') as f:
            json.dump(options, f)

        html_target = os.path.join(options_dir, 'electron-loading.html')
        html_content = build_loading_html(app.config)

        with open(html_target, 'w') as f:
            f.write(html_content)

        env['DAZZLER_LOADING_WINDOW_OPTIONS'] = options_file
        env['DAZZLER_LOADING_WINDOW_FILE'] = html_target

    try:
        proc = await asyncio.create_subprocess_shell(' '.join(cmd), env=env)
        await proc.communicate()
    finally:
        shutil.rmtree(options_dir, ignore_errors=True)
