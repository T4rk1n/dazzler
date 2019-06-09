"""Utils methods for pytest-dash such wait_for wrappers"""
import asyncio
import pprint
import time

from concurrent.futures import ThreadPoolExecutor


from selenium.common.exceptions import TimeoutException
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.select import By

import functools


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

    _wait_for(driver, condition, timeout=timeout)


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

    _wait_for(driver, condition, timeout=timeout)


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

    _wait_for(driver, condition, timeout=timeout)


def wait_for_client_app_started(driver, url, wait_time=0.5, timeout=10):
    # Wait until the #_dash-app-content element is loaded.
    start_time = time.time()
    loading_errors = (
        'Error loading layout',
        'Error loading dependencies',
        'Internal Server Error',
    )
    while True:
        try:
            driver.get(url)
            wait_for_element_by_css_selector(
                driver, '#dazzler-rendered', timeout=wait_time
            )
            return
        except TimeoutException:
            body = wait_for_element_by_css_selector(driver, 'body')
            if any(x in body.text for x in loading_errors) \
                    or time.time() - start_time > timeout:

                logs = driver.get_log('browser')
                raise Exception(
                    'Dazzler could not start after {}:'
                    ' \nHTML:\n {}\n\nLOGS: {}'.format(
                        timeout, body.get_property('innerHTML'),
                        pprint.pformat(logs)
                    )
                )


def _async_wrap(func):

    @functools.wraps(func)
    async def _wrapped(self, *args, **kwargs):
        return await self.loop.run_in_executor(
            self.executor,
            functools.partial(func, self.driver, *args, **kwargs)
        )

    return _wrapped


def _get_url(driver, url):
    return driver.get(url)


def _click_element(_, element):
    return element.click()


class AsyncDriver:
    def __init__(self, driver, loop=None):
        """
        :param driver: Selenium driver
        :type driver: selenium.webdriver.remote.webdriver.WebDriver
        :param loop: Asyncio event loop
        """
        self.driver = driver
        self.loop = loop or asyncio.get_event_loop()
        self.executor = ThreadPoolExecutor()

    wait_for_element_by_id = _async_wrap(wait_for_element_by_id)
    wait_for_element_by_css_selector = _async_wrap(wait_for_element_by_css_selector)
    wait_for_element_by_xpath = _async_wrap(wait_for_element_by_xpath)
    wait_for_property_to_equal = _async_wrap(wait_for_property_to_equal)
    wait_for_text_to_equal = _async_wrap(wait_for_text_to_equal)
    wait_for_style_to_equal = _async_wrap(wait_for_style_to_equal)
    wait_for_client_app_started = _async_wrap(wait_for_client_app_started)
    get = _async_wrap(_get_url)


