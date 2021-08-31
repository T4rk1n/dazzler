import os
import typing
from aiohttp import web

from .transforms import TiedTransform
from ..electron import ElectronWindowSettings
from ..tools import get_package_path
from ._binding import (
    Binding, BoundAspect, Trigger, State, Target, coerce_binding
)
from ._component import Component
from ._package import Package
from ._requirements import Requirement, collect_requirements
from ._route import Route, RouteMethod


# pylint: disable=too-many-instance-attributes
class Page:
    """A page of the application."""

    def __init__(
            self,
            name: str,
            layout: typing.Union[Component, typing.Callable[[web.Request], typing.Awaitable[Component]]],  # noqa: E501
            url: str = None,
            bindings: list = None,
            routes: typing.List[Route] = None,
            requirements: typing.List[Requirement] = None,
            requirements_dir: str = 'requirements',
            title: str = None,
            lang: str = 'en',
            header: str = '',
            footer: str = '',
            favicon: str = '',
            meta_tags: typing.List[typing.Dict[str, str]] = None,
            packages: typing.List[str] = None,
            require_login: bool = False,
            electron_window: ElectronWindowSettings = None
    ):
        """
        :param name: Unique name for the page, usually give __name__.
        :param layout: Root component or function returning a Component. In the
            case of a function, the request will be None on setup.
        :param url: Url, default to ``/name``.
        :param bindings: Bindings of component aspects for this page.
        :param routes: Additional routes to register with this page.
        :param requirements: List of requirements to
        :param title: Title of the page.
        :param lang: lang attribute of the html tag.
        :param header: Static header to include as first child on the page.
        :param footer: Static footer to include as last child on the page.
        :param favicon: Url to favicon for the page.
        :param meta_tags: Meta tags of the page.
        :param packages: Packages list to use on the page instead
            of the whole registry.
        :param require_login: Page requires that user is logged in.
        :param electron_window: Settings for the electron window like size.
        """
        self.name = name.split('.')[-1]
        self.base_name = name
        try:
            self.page_path = get_package_path(name)
        except ImportError:
            # The requirements dir is then absolute.
            self.page_path = ''

        self.title = title or self.name
        self.url = url or f'/{self.name}'
        self.routes = routes or []
        self.layout = layout
        self.bindings = bindings or []
        self.requirements = requirements or []
        for requirement in self.requirements:
            requirement.page = self.name

        self.requirements_dir = os.path.join(self.page_path, requirements_dir)

        # Collect all requirement in the requirement folder.
        if os.path.exists(self.requirements_dir):
            self.requirements += collect_requirements(
                self.requirements_dir, page=self.name
            )

        self.header = header
        self.footer = footer
        self.favicon = favicon
        self.meta_tags = meta_tags or []
        self.packages = packages
        self.lang = lang
        self._bindings = {str(x.trigger): x for x in self.bindings}
        self.require_login = require_login
        self._ties = []
        self.electron_window = electron_window

    async def prepare(
            self,
            request: web.Request,
            debug=False,
            external=False
    ) -> dict:
        """
        Prepare the page for rendering.

        :param request: The request to prepare for.
        :param debug: To collect dev package
        :param external: Serve external requirements if available.
        :return: prepared dict with layout and page name.
        """
        layout = self.layout
        if callable(layout):
            layout = await layout(request)

        packages = [
            Package.package_registry[x].prepare(
                dev=debug, external=external)
            for x in self.packages
        ] if self.packages is not None else [
            x.prepare(dev=debug, external=external)
            for x in Package.package_registry.values()
            if x.name != 'dazzler_renderer'
        ]

        # noinspection PyProtectedMember
        return {
            'layout': layout._prepare(),
            'page': self.name,
            'bindings': {
                x['key']: x for y in self.bindings for x in y.prepare()
            },
            'requirements': [
                x.prepare(external=external)
                for x in self.requirements
            ],
            'packages': packages,
            'ties': [
                t.prepare() for t in self._ties
            ]
        }

    def bind(
            self,
            trigger: typing.Union[Trigger, str],
            *states: typing.Union[State, str],
            once: bool = False,
    ):
        """
        Attach a function to be called when the trigger update on the client.

        :param trigger: Aspect to trigger the binding.
        :param states: States to includes in the binding message.
        :param once: Execute the binding only once
        :return:
        """
        trg = coerce_binding(trigger)
        sts = coerce_binding(list(states), State)

        if isinstance(trg, list):
            for t in trg:
                t.once = once
        elif trg.once is None:
            trg.once = once

        def _wrapper(func):
            binding = Binding(trg, sts)(func)
            self.bindings.append(binding)
            for trig in binding.triggers:
                self._bindings[str(trig)] = binding
            return func

        return _wrapper

    def get_binding(self, key) -> BoundAspect:
        """
        Get the binding from the trigger key.

        :param key: Trigger key
        :return:
        """
        return self._bindings.get(key)

    def route(
            self,
            path,
            method: typing.Union[str, RouteMethod] = RouteMethod.GET,
            name=None,
            prefix=True
    ):
        """
        Add a route with a decorator.

        :param path: Url to handle.
        :param method: Method of the route.
        :param name: Unique name for the route.
        :param prefix: Prefix the path with the page path.
        :return:
        """
        if prefix:
            url = '/'.join([self.url.rstrip('/'), path.lstrip('/')])
        else:
            url = path

        def _page_route(func):
            self.routes.append(
                Route(url, func, name=name, method=method)
            )
            return func

        return _page_route

    def tie(
        self,
        trigger: typing.Union[Trigger, str],
        *target: typing.Union[Target, str],
        once: bool = None
    ):
        """
        Update target(s) aspect on trigger from the frontend.

        **Example**

        .. code-block:: python

            from dazzler.system import Page
            from dazzler.components import core

            page = Page(
                __name__,
                core.Container([
                    core.Input(identity='input'),
                    core.Container(identity='output')
                ])
            )

            page.tie('value@input', 'children@output')

        :param trigger: Aspect to set the target when the value change.
        :param target: Aspect to update from the trigger value.
        :param once: Execute the tie only once.
        :return:
        """
        trig = coerce_binding(trigger, Trigger)
        targ = coerce_binding(list(target), Target)

        if trig.once is None:
            trig.once = once

        tied = TiedTransform(trig, targ)
        self._ties.append(tied)
        return tied

    def __str__(self):
        return f'{self.name}@{self.url}'

    def __hash__(self):
        return hash((self.name, self.url))

    def __repr__(self):
        return f'<Page name="{self.name}" href="{self.url}">'
