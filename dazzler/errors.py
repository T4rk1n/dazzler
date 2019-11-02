class DazzlerError(Exception):
    """Base Dazzler error"""


class PackageConflictError(DazzlerError):
    """A conflict in package name was detected."""


class PageConflictError(DazzlerError):
    """Duplicate page name or url detected."""


class ServerStartedError(DazzlerError):
    """Action require the server to be uninitialized."""


class BindingError(DazzlerError):
    """Error in the binding system"""


class NoInstanceFoundError(DazzlerError):
    """No instance was found when the application is run by command line."""


class GetAspectError(BindingError):
    """Error while retrieving an aspect from the frontend."""


class TriggerLoopError(BindingError):
    """Setting the same aspect that triggered results in infinite loop."""


class RequirementError(DazzlerError):
    """An error in the requirement system"""


class InvalidRequirementError(RequirementError):
    """No internal file or external file was given."""


class InvalidRequirementKindError(RequirementError):
    """Don't know what to do with this kind of requirements."""


class RequirementNotFoundError(RequirementError):
    """The requirement file did not exist."""


class SessionError(DazzlerError):
    """Error related to session system."""


class AuthError(DazzlerError):
    """Error related to authentication system."""
