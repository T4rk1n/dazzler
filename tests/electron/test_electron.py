import asyncio
import os
import shutil
import tempfile
import pytest

import stringcase

from dazzler import Dazzler
from dazzler.electron import ElectronBuilder


@pytest.mark.parametrize(
    'provider, provider_config',
    [
        (
            'generic',
            {
                'url': '/url',
                'channel': 'chan',
                'use_multiple_range_request': True
            }
        ),
        (
            'bintray',
            {
                'package': 'pack',
                'repo': 'rep'
            }
        ),
        (
            'github',
            {
                'v_prefixed_tag_name': True,
            }
        ),
        (
            's3',
            {
                'storage_class': 'normal'
            }
        ),
        (
            'spaces',
            {
                'path': 'not $PATH'
            }
        ),
        (
            'snap', {}
        )
    ]
)
def test_publish_config(provider, provider_config):
    app = Dazzler(__name__)
    app.config.read_dict(
        {'electron': {'publish': {provider: provider_config}}}
    )
    app.config.electron.publish.provider = provider

    builder = ElectronBuilder(
        app, 'tests/electron/electron_app.py', 'dir', 'output', publish=True)

    package = {'build': {}}
    builder._create_publish(package)
    assert package['build']['publish']['provider'] == provider
    for k, v in provider_config.items():
        assert package['build']['publish'][stringcase.camelcase(k)] == v


@pytest.mark.async_test
async def test_electron_builder(electron_driver):
    # Only way I found to automate the testing is by building
    # the binary for selenium on chrome.
    # Need to make sure the chrome-driver
    # is the same version of chromium for the electron version.
    output_dir = tempfile.mkdtemp('dazzler-electron')

    try:
        proc = await asyncio.create_subprocess_shell(
            f'dazzler -c tests/electron/dazzler.toml '
            f'electron-build tests/electron/electron_app.py'
            f' -o {output_dir}'
        )
        await proc.communicate()
        code = await proc.wait()

        assert code == 0
        binary_output = os.path.join(
            output_dir, 'dist', 'linux-unpacked', 'dazzler-electron'
        )
        driver = electron_driver(binary_output)
        await driver.wait_for_text_to_equal(
            '#main', 'Main'
        )
        await driver.click('#clicker')
        await driver.wait_for_text_to_equal('#output', 'Clicks 1')
    finally:
        shutil.rmtree(output_dir)