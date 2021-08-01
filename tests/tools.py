"""Tests tools for running selenium with asyncio."""
import asyncio
import functools
import os
import signal
import subprocess
import sys

from selenium.common.exceptions import TimeoutException
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.select import By

from precept import AsyncExecutor


def _wait_for(driver, condition, timeout=10.0):
    return WebDriverWait(driver, timeout).until(condition)


def _wait_for_element(driver, by, accessor, timeout=10.0):
    return _wait_for(
        driver,
        EC.presence_of_element_located((by, accessor)),
        timeout=timeout
    )


def wait_for_element_by_css_selector(driver, selector, timeout=10.0):
    """
    Wait until a single element is found and return it.
    This variant use the css selector api:
    https://www.w3schools.com/jsref/met_document_queryselector.asp

    :param driver: Selenium driver
    :type driver: selenium.webdriver.remote.webdriver.WebDriver
    :param selector: CSS selector to find.
    :type selector: str
    :param timeout: Maximum time to find the element.
    :type timeout: float
    :return:
    """
    return _wait_for_element(
        driver, By.CSS_SELECTOR, selector, timeout=timeout
    )


def wait_for_elements_by_css_selector(driver, selector, timeout=10.0):
    """
    Wait until all elements are found by the selector before the timeout.

    :param driver: Selenium driver
    :type driver: selenium.webdriver.remote.webdriver.WebDriver
    :param selector: Search for elements
    :type selector: str
    :param timeout: Maximum wait time
    :type timeout: float
    :return: Found elements
    """
    return _wait_for(
        driver,
        EC.presence_of_all_elements_located((By.CSS_SELECTOR, selector)),
        timeout=timeout
    )


def wait_for_element_by_xpath(driver, xpath, timeout=10):
    """
    Wait until a single element is found and return it.
    This variant use xpath to find the element.
    https://www.w3schools.com/xml/xml_xpath.asp

    :param driver: Selenium driver
    :type driver: selenium.webdriver.remote.webdriver.WebDriver
    :param xpath: Xpath query string.
    :type xpath: str
    :param timeout: Maximum time to find the element.
    :type timeout: float
    :return:
    """
    return _wait_for_element(driver, By.XPATH, xpath, timeout=timeout)


def wait_for_elements_by_xpath(driver, xpath, timeout=10):
    """
    Wait until all are found before the timeout.
    This variant use xpath to find the elements.
    https://www.w3schools.com/xml/xml_xpath.asp

    :param driver: Selenium driver
    :type driver: selenium.webdriver.remote.webdriver.WebDriver
    :param xpath: Xpath query string.
    :type xpath: str
    :param timeout: Maximum time to find the element.
    :type timeout: float
    :return:
    """
    return _wait_for(
        driver,
        EC.presence_of_all_elements_located((By.XPATH, xpath)),
        timeout=timeout
    )


def wait_for_element_by_id(driver, _id, timeout=10):
    """
    Wait until a single element is found and return it.
    This variant find by id.

    :param driver: Selenium driver
    :type driver: selenium.webdriver.remote.webdriver.WebDriver
    :param _id: The id of the element to find.
    :param timeout: Maximum time to find the element.
    :type timeout: float
    :return:
    """
    return _wait_for_element(driver, By.ID, _id, timeout=timeout)


def wait_for_text_to_equal(driver, selector, text, timeout=10):
    """
    Wait an element text found by css selector is equal to text.

    :param driver: Selenium driver
    :type driver: selenium.webdriver.remote.webdriver.WebDriver
    :param selector: Selector of the element to assert it's text property.
    :type selector: str
    :param text: Text to equal.
    :type text: str
    :param timeout: Maximum time for the text to equal.
    :type timeout: float
    :return:
    """

    def condition(d):
        return text == d.find_element_by_css_selector(selector).text

    try:
        _wait_for(driver, condition, timeout=timeout)
    except TimeoutException as err:
        value = driver.find_element_by_css_selector(selector).text
        raise AssertionError(
            f'Element Text assertion failed: {selector}\n'
            f'Expected: {text}\n'
            f'Found: {value}'
        ) from err


def wait_for_style_to_equal(
        driver, selector, style_attribute, style_assertion, timeout=10
):
    """
    Wait for an element style attribute to equal.

    :param driver: Selenium driver
    :type driver: selenium.webdriver.remote.webdriver.WebDriver
    :param selector: Selector of the element to assert it's style property.
    :type selector: str
    :param style_attribute: The name of the CSS attribute to assert.
    :type style_attribute: str
    :param style_assertion: The value to equal of CSS attribute.
    :type style_assertion: str
    :param timeout: Maximum time.
    :type timeout: float
    :return:
    """

    def condition(d):
        return style_assertion == d.find_element_by_css_selector(selector)\
            .value_of_css_property(style_attribute)

    try:
        _wait_for(driver, condition, timeout=timeout)
    except TimeoutException as err:
        value = driver.find_element_by_css_selector(selector)\
            .value_of_css_property(style_attribute)
        raise AssertionError(
            f'Style assertion failed: {style_attribute} of {selector}\n'
            f'Expected: {style_assertion}\n'
            f'Found: {value}'
        ) from err


def wait_for_property_to_equal(
        driver, selector, prop_name, prop_value, timeout=10
):
    """
    Wait for an element property to equal a value.

    :param driver: Selenium driver
    :type driver: selenium.webdriver.remote.webdriver.WebDriver
    :param selector: Selector of the element to assert it's property.
    :type selector: str
    :param prop_name: The name of property.
    :type prop_name: str
    :param prop_value: The value to assert.
    :param timeout: Maximum time.
    :type timeout: float
    :return:
    """

    def condition(d):
        return prop_value == d.find_element_by_css_selector(selector)\
            .get_property(prop_name)

    try:
        _wait_for(driver, condition, timeout=timeout)
    except TimeoutException as err:
        value = driver.find_element_by_css_selector(selector)\
            .get_property(prop_name)

        raise AssertionError(
            f'Element property assertion failed: {prop_name} of {selector}\n'
            f'Expected: {prop_value}\n'
            f'Found: {value}'
        ) from err


def _async_wrap(func):

    @functools.wraps(func)
    async def _wrapped(self, *args, **kwargs):
        return await self.executor.execute(
            func, self.driver, *args, **kwargs
        )

    return _wrapped


def _get_url(driver, url):
    return driver.get(url)


def _click_element(driver, selector, timeout=10.0):
    element = _wait_for(
        driver,
        EC.element_to_be_clickable((By.CSS_SELECTOR, selector)),
        timeout=timeout
    )
    element.click()
    return element


class AsyncDriver:
    def __init__(self, driver):
        """
        :param driver: Selenium driver
        :type driver: selenium.webdriver.remote.webdriver.WebDriver
        """
        self.driver = driver
        self.executor = AsyncExecutor()

    wait_for_element_by_id = _async_wrap(wait_for_element_by_id)
    wait_for_element_by_css_selector = _async_wrap(
        wait_for_element_by_css_selector
    )
    wait_for_elements_by_css_selector = _async_wrap(
        wait_for_elements_by_css_selector
    )
    wait_for_element_by_xpath = _async_wrap(wait_for_element_by_xpath)
    wait_for_elements_by_xpath = _async_wrap(wait_for_elements_by_xpath)
    wait_for_property_to_equal = _async_wrap(wait_for_property_to_equal)
    wait_for_text_to_equal = _async_wrap(wait_for_text_to_equal)
    wait_for_style_to_equal = _async_wrap(wait_for_style_to_equal)
    get = _async_wrap(_get_url)

    click = _async_wrap(_click_element)


async def get_child_processes(cmd, pid):
    proc = await asyncio.create_subprocess_shell(
        cmd.format(pid), stdout=subprocess.PIPE
    )
    out, err = await proc.communicate()
    return [int(x) for x in out.decode().strip(' \n').split(' ')]


async def kill_processes(pid):
    if sys.platform == 'win32':
        proc = await asyncio.create_subprocess_shell(
            f'taskkill /pid {pid} /T /F'
        )
        await proc.communicate()
        return

    if sys.platform == 'darwin':
        processes = await get_child_processes(
            'psgrep -P {0}', pid
        )
    else:
        processes = await get_child_processes(
            'ps -o pid --no-headers --ppid {0}', pid
        )
    for proc in (processes + [pid]):
        os.kill(proc, signal.SIGTERM)
