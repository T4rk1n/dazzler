"""
Dazzler systems (API)

- Requirements are JS/CSS resources to include on rendering.
- Packages hold components info and it's requirements.
- Component Aspects are shared between backend and frontend with bindings.
- Generate components with
``dazzler generate metadata.json output_dir``
- Page holds meta data for page rendering and requirements, routes, layout and
bindings used on a single page of the application.
"""
from ._component import Component, Aspect
from ._binding import *
from ._package import Package
from ._requirements import (
    Requirement,
    RequirementWarning,
    assets_to_requirements,
    collect_requirements,
)
from ._generator import generate_components
from ._undefined import UNDEFINED, Undefined
from ._page import Page
