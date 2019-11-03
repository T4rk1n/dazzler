import itertools
import os
import asyncio
import sys
import typing
import pathlib
import subprocess
import time
import re

from ._assets import assets_path
from .tools import OrderedSet


# aioredis likes to changes it's files at runtime...
redis_exclude = re.compile(r'(stringprep\.py|aioredis|hiredis|idna\.py)')


async def watch(
        directories: typing.Set,
        extra_files: list,
        on_change: typing.Callable,
        interval: float = 0.5,
        threshold: float = 3.0,
):
    """
    Watch for file changes in directories and files.

    :param directories: Directories to watch.
    :param extra_files:
    :param on_change: What to do on change, takes the names of the changed
        files as first argument.
    :param interval: The rate at which to perform the change check on the files
    :param threshold: Wait time from first change til it fires reload events.
    :return:
    """
    timestamps = {}
    initial = True

    def handle_file(filepath):
        path = pathlib.Path(filepath)

        # Removes eggs
        if '.egg/' in filepath:
            return False

        if not path.exists():
            if filepath in timestamps:
                timestamps.pop(filepath)
                return True
            return False

        new = path.stat().st_mtime
        old = timestamps.get(filepath)

        if old != new:
            timestamps[filepath] = new
            if not initial:
                return True
        return False

    change_start = None
    changed = set()
    deleted_files = set()

    while True:
        looped = set()
        for file in itertools.chain(
                (
                    os.path.join(current, f)
                    for directory in directories
                    for current, _, files in os.walk(directory)
                    for f in files
                ),
                # Python files, won't detect new files unless they are imported
                # by a file that is currently used.
                (
                    x.__file__
                    for x in sys.modules.values()
                    if (
                            hasattr(x, '__file__')
                            and x.__file__
                            and not redis_exclude.search(x.__file__)
                    )
                ),
                extra_files,
        ):
            looped.add(file)
            if handle_file(file):
                changed.add(file)

        missings = set(timestamps.keys()).difference(looped)
        for removed in missings:
            deleted_files.add(removed)
            timestamps.pop(removed)

        if changed or deleted_files:
            if change_start is None:
                change_start = time.time()

            if time.time() - change_start > threshold:
                stop = await on_change(changed, deleted_files)
                if stop:
                    return
                changed = set()
                deleted_files = set()
                change_start = None

        initial = False
        await asyncio.sleep(interval)


async def run_reloaded(app, start_event):
    run_stop = asyncio.Event()

    if app.module_name == '__main__':
        # Main can't be called so get the path from the file instead.
        app_path = pathlib.Path(app.module_file).relative_to(os.getcwd())
        app_path = str(app_path).replace('.py', '').replace(os.sep, '.')
    else:
        app_path = app.module_name

    app.logger.debug(f'Starting app in reloaded mode: {app_path}')

    args = OrderedSet(*f'{sys.executable} -m dazzler'.split())
    for arg in itertools.chain(
            app.cli.raw_args,
            ['--application', app_path, '--reload', '--reloaded']
    ):
        args.add(arg)

    proc = subprocess.Popen(
        list(args),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )

    def handle_std(stream, outfile):
        while not run_stop.is_set() and not app.stop_event.is_set():
            data = stream.readline()
            if app.stop_event.is_set():
                proc.kill()
                proc.wait()
                return
            if data:
                data = data.decode().strip()
                if start_event and 'Started server' in data:
                    start_event.set()
                print(data, file=outfile)

    async def handle_poll():
        while proc.poll() is None:
            if app.stop_event.is_set():
                proc.kill()
                proc.wait()
                run_stop.set()
                return
            await asyncio.sleep(0.001)
        run_stop.set()

    async def cleanup(_):
        if proc.poll() is None:
            proc.kill()
            proc.wait()

    async def handle_stop():
        await app.stop_event.wait()
        await cleanup(None)

    # Keyboard interrupt prevent the subprocess from terminating and
    # would otherwise require a KILL signal.
    app.events.subscribe('KeyboardInterrupt', cleanup)
    app.events.subscribe('dazzler_stop', cleanup)
    stopper = app.loop.create_task(handle_stop())

    await asyncio.gather(
        # Run these in threads since they block and get stuck
        app.executor.execute(handle_std, proc.stdout, None),
        app.executor.execute(handle_std, proc.stderr, sys.stderr),
        handle_poll(),
    )
    if not stopper.done():
        stopper.cancel()


async def start_reloader(app, reloaded=False, start_event=None):
    """
    Start the reload mechanism.

    Re-run the application under a new subprocess if root.
    Otherwise run the watch and send reload events to connected
    websockets.

    :param app: The dazzler instance to reload
    :type app: dazzler.Dazzler
    :param reloaded: If the python is currently reloaded.
    :param start_event: Event to set once the reloaded instance has started.
    :return:
    """

    if not reloaded:
        while not app.stop_event.is_set():
            # Run this forever reloading every time the watch detect python
            # file change
            await run_reloaded(app, start_event)
            app.logger.info('Reloading...')
    else:
        # Watch files on live server to send reload update thru ws.

        watch_directories = set(
            directory for directory in itertools.chain(
                [app.config.static_folder, assets_path],
                [x.requirements_dir for x in app.pages.values()]
            ) if directory
        )
        # Take all requirements that are not in the watch directories.
        extra_files = [
            requirement.internal
            for requirement in app.collect_requirements()
            if requirement.internal and not any(
                pathlib.Path(x) in pathlib.Path(requirement.internal).parents
                for x in watch_directories
            )
        ]
        app.logger.debug('Starting reload watch.')
        await watch(
            watch_directories,
            extra_files,
            app.on_file_change,
            app.config.development.reload_interval,
            app.config.development.reload_threshold,
        )
        await app.stop()
