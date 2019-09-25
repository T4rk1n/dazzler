"""Page system specifics tests."""
import json

import pytest

from aiohttp import web

from dazzler import Dazzler
from dazzler.errors import PageConflictError
from dazzler.system import Page
from dazzler.components import core


@pytest.mark.async_test
async def test_page_meta_attributes(start_page, browser):
    meta = [
        {'name': 'description', 'content': 'test dazzler'},
        {'name': 'custom', 'content': 'customized'},
    ]
    await start_page(
        Page(
            name='meta',
            layout=core.Container('Hello', identity='layout'),
            meta_tags=meta
        )
    )
    meta_tags = await browser.wait_for_elements_by_css_selector('meta')

    # Meta charset + http-equiv always present (+2)
    assert len(meta_tags) == 4

    for i in range(2, len(meta_tags)):
        meta_dict = meta[i - 2]
        meta_tag = meta_tags[i]
        for k, v in meta_dict.items():
            assert meta_tag.get_attribute(k) == v


@pytest.mark.async_test
async def test_page_static_header(start_page, browser):
    await start_page(
        Page('header', core.Container(), header='<div>Header</div>')
    )
    await browser.wait_for_text_to_equal('body > div:first-child', 'Header')


@pytest.mark.async_test
async def test_page_static_footer(start_page, browser):
    await start_page(
        Page('header', core.Container(),
             footer='<div id="footer">Footer</div>')
    )
    await browser.wait_for_text_to_equal('#footer', 'Footer')


@pytest.mark.async_test
async def test_page_title(start_page, browser):
    # Page title should take the title explicitly
    await start_page(
        Page('page-title', core.Container(), title='Custom title')
    )
    assert browser.driver.title == 'Custom title'


@pytest.mark.async_test
async def test_page_default(start_page, browser):
    # By default the page title should be the name of the page.
    await start_page(
        Page('page-title', core.Container())
    )
    assert browser.driver.title == 'page-title'


@pytest.mark.async_test
async def test_page_routes(start_page, browser):

    page = Page('page-routes', core.Container())

    @page.route('/page-route')
    async def page_route(_):
        return web.Response(
            body='<html><head></head><body>'
                 '<div id="content">Page route</div>'
                 '</body></html>',
            content_type='text/html'
        )

    await start_page(page)

    await browser.get('http://localhost:8150/page-routes/page-route')
    await browser.wait_for_text_to_equal('#content', 'Page route')


@pytest.mark.async_test
async def test_page_favicon(start_page, browser):
    favicon = '/favicon'

    await start_page(
        Page('favicon-page', core.Container(), favicon=favicon)
    )

    await browser.wait_for_element_by_xpath(f'//link[@href="{favicon}"]')


def test_page_name_conflict():
    page_one = Page('one', core.Container())
    page_two = Page('one', core.Container())

    app = Dazzler(__name__)
    with pytest.raises(PageConflictError) as context:
        app.add_page(page_one, page_two)

    assert context.value.args[0] == 'Duplicate page name: one@/one'


def test_page_url_conflict():
    page_one = Page('one', core.Container())
    page_two = Page('two', core.Container(), url='/one')

    app = Dazzler(__name__)
    with pytest.raises(PageConflictError) as context:
        app.add_page(page_one, page_two)

    assert context.value.args[0] == 'Duplicate page url: two@/one'


# pylint: disable=unused-import
@pytest.mark.async_test
async def test_page_requirements_package_override(start_page, browser):
    # Overriding the package is an optimization if some pages uses big bundles
    # and others pages are more lightweight, down the line maybe add
    # on-demand loading of requirements, it's already set up for it.
    # noinspection PyUnresolvedReferences
    from tests.components import spec_components as spec  # noqa: F401

    page = Page(
        __name__,
        core.Container('Rendered'),
        packages=['dazzler_core']
    )
    await start_page(page)
    await browser.wait_for_element_by_css_selector('.dazzler-rendered')

    scripts = await browser.wait_for_elements_by_css_selector('script')
    for script in scripts:
        src = script.get_attribute('src')
        assert 'dazzler_test' not in src


# Try this 3 times to make sure it's not luck...
# Prototype used to load all async so even if they were inserted in
# order, some would load faster than other and thus no actual ordering but it
# would pass the test most of the time.
@pytest.mark.parametrize('_', range(3))
@pytest.mark.async_test
async def test_page_requirements_dir(start_page, browser, _):
    # Page requirements should be loaded after packages requirements
    # and in the order they are found and defined.
    # Also load explicit requirement before the requirements directory
    # meaning if you use an external library in them they be loaded.
    from tests.apps.pages.page_assets import page

    await start_page(page)

    await browser.wait_for_style_to_equal(
        '.loaded', 'background-color', 'rgba(255, 0, 0, 1)'
    )

    output = json.loads(
        (await browser.wait_for_element_by_id('done-output')).text
    )

    expected = [1, 2, 10, "same1", "with-requirements", "nested", "same2"]
    assert output == expected
