import os
import shutil
import tempfile
import pytest
import asyncio


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
