"""
Dazzler systems (API)

- Requirements are JS/CSS resources to include on rendering.
- Packages hold components info and it's requirements.
- Component Aspects are shared between backend and frontend with bindings.
- Generate components with ``dazzler generate metadata.json output_dir``
- Page holds meta data for rendering, requirements, routes, layout, bindings.
"""
from ._component import Component, Aspect  # noqa: F401
from ._binding import *  # noqa: F401, F403
from ._package import Package  # noqa: F401
from ._requirements import (  # noqa: F401
    Requirement,
    RequirementWarning,
    assets_to_requirements,
    collect_requirements,
)
from ._generator import generate_components, generate_meta  # noqa: F401
from ._undefined import UNDEFINED, Undefined  # noqa: F401
from ._page import Page  # noqa: F401
from ._middleware import Middleware  # noqa: F401
from ._route import Route, RouteMethod  # noqa: F401


__all__ = [  # noqa: F405
    'Component',
    'Aspect',
    'BindingContext',
    'Binding',
    'Trigger',
    'State',
    'BoundAspect',
    'Package',
    'Requirement',
    'RequirementWarning',
    'assets_to_requirements',
    'collect_requirements',
    'generate_components',
    'generate_meta',
    'UNDEFINED',
    'Undefined',
    'Page',
    'Middleware',
    'Route',
    'RouteMethod',
]
