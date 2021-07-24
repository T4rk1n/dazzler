import shlex
import asyncio
import sys
import os

from dazzler._assets import electron_path
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
    proc = await asyncio.create_subprocess_shell(' '.join(cmd), env=env)
    await proc.communicate()
