"""Aspects Binding"""
import functools
import typing
import uuid
import asyncio

from aiohttp import web

from .session import Session
from ._undefined import UNDEFINED
from ._component import prepare_aspects
from ._package import Package


from ..errors import TriggerLoopError, GetAspectError, BindingError

__all__ = [
    'Trigger', 'State', 'Target', 'BoundAspect', 'Binding', 'BindingContext',
    'CallContext', 'coerce_binding'
]


def is_component(aspect):
    return isinstance(aspect, dict) \
           and 'identity' in aspect \
           and 'aspects' in aspect \
           and 'name' in aspect \
           and 'package' in aspect


def hydrate(aspect):
    if is_component(aspect):
        pack = Package.package_registry[aspect['package']]
        cls = pack.components[aspect['name']]
        return cls(**hydrate(aspect['aspects']), identity=aspect['identity'])
    if isinstance(aspect, dict):
        data = {}
        for key, value in aspect.items():
            data[key] = hydrate(value)
        return data
    if isinstance(aspect, list):
        return [hydrate(x) for x in aspect]
    return aspect


class BoundValue(typing.NamedTuple):
    identity: str
    aspect: str
    value: typing.Any


class _Bind:
    def __init__(self, identity: str, aspect: str, regex=False):
        """
        :param identity: The identity of the component to bind.
        :param aspect: Aspect name to trigger/state.
        :param regex: Identity and aspects are converted into regex and
            matched against for trigger and states.
        """
        self.identity = identity
        self.aspect = aspect
        self.regex = regex

    def __str__(self):
        return f'{self.aspect}@{self.identity}'

    def __repr__(self):
        return f'<{self.__class__.__name__} {self}>'

    def __eq__(self, other):
        return isinstance(other, _Bind) and str(self) == str(other)

    def __hash__(self):
        return hash(str(self))

    def prepare(self) -> dict:
        """
        Prepare the trigger or state for serialization.

        :return: Identity and aspect in a dict.
        """
        return {
            'identity': self.identity,
            'aspect': self.aspect,
            'regex': self.regex,
            'key': str(self)
        }


# pylint: disable=too-few-public-methods
class Trigger(_Bind):
    """Trigger the bound aspect callbacks."""
    def __init__(
        self,
        identity: str,
        aspect: str,
        regex=False,
        once=None,
        skip_initial=False,
    ):
        super().__init__(identity, aspect, regex)
        self.once = once
        self.skip_initial = skip_initial

    def prepare(self) -> dict:
        return {
            **super().prepare(),
            'once': self.once,
            'skip_initial': self.skip_initial,
        }


TriggerList = typing.List[Trigger]


# pylint: disable=too-few-public-methods
class State(_Bind):
    """Usable aspect value in bound aspect without trigger on change."""


# pylint: disable=too-few-public-methods
class Target(_Bind):
    """
    A connection target that will be updated when
    the trigger is updated on the frontend.

    Target has shorthand syntax ``aspect@identity`` to use with
    transforms.
    """
    def __init__(self,
                 shorthand: str = None,
                 identity: str = None,
                 aspect: str = None,
                 regex: bool = False):
        if shorthand and '@' in shorthand:
            aspect, identity = shorthand.split('@')
        elif not identity or not aspect:
            raise BindingError(
                f'Invalid Target arguments provided:'
                f' short={shorthand} identity={identity} aspect={aspect}'
            )
        super().__init__(identity, aspect, regex)


StateList = typing.List[State]


class BoundAspect:
    """
    A trigger aspect bound to a method intended to be called when changed.

    Data holder for the handler, trigger and state.
    """
    def __init__(
            self,
            handler,
            trigger: typing.Union[TriggerList, Trigger],
            states: StateList = None,
            call: bool = False,
    ):
        self.handler = handler
        self.trigger = trigger
        self.states = states or []
        self.call = call

    def prepare(self) -> list:
        """
        Prepare the binding for serialization.

        :return: list of dict with trigger and states definitions.
        """
        return [
            {
                'trigger': trigger.prepare(),
                'states': [state.prepare() for state in self.states],
                'key': str(trigger),
                'regex': trigger.regex,
                'call': self.call,
            } for trigger in self.triggers
        ]

    @property
    def triggers(self):
        if isinstance(self.trigger, Trigger):
            return [self.trigger]
        return self.trigger

    async def __call__(self, *args, **kwargs):
        return await self.handler(*args, **kwargs)

    def __get__(self, instance, owner):
        if instance is None:
            return self
        # Patch self if used in a class.
        return functools.partial(self.__call__, instance)

    def __str__(self):
        return str(self.trigger)

    def __repr__(self):
        return f'<BoundAspect {self}>'

    def __eq__(self, other):
        return isinstance(other, BoundAspect) and str(self) == str(other)

    def __hash__(self):
        return hash(str(self))


class BaseContext:
    """
    The context in which the bound function execute.

    :type auth: dazzler.system.auth.DazzlerAuth
    :type user: dazzler.system.auth.User
    """
    def __init__(
        self,
        identity: str,
        request: web.Request,
        trigger: BoundValue,
        states: typing.Dict[str, dict],
    ):
        self.identity = identity
        self.request = request
        self.trigger = trigger
        self.states = states
        self.dazzler = request.app['dazzler']
        self.auth = self.dazzler.auth
        self.user = request.get('user')
        self.session: Session = request.get('session')


class BindingContext(BaseContext):
    """
    Context used by websockets binding, ``@page.bind``).

    Can request aspects from the frontend and interact with
    the ``WebStorage`` api.
    """
    def __init__(
            self,
            identity: str,
            request: web.Request,
            trigger: BoundValue,
            states: typing.Dict[str, BoundValue],
            websocket: web.WebSocketResponse,
            request_queue: asyncio.Queue,
            create_task: typing.Callable
    ):
        super().__init__(identity, request, trigger, states)
        self.websocket = websocket
        self.create_task = create_task
        self._request_queue = request_queue
        self._response_queue = asyncio.Queue()

    async def set_aspect(self, identity, **aspects):
        """
        Update aspects of a component on the front end.

        :param identity: Identity of the component to update.
        :param aspects: The aspects to set on the component.
        :return:
        """
        if identity == self.identity:
            if any(x == self.trigger.aspect for x in aspects):
                trigger_key = f'{self.trigger.identity}.{self.trigger.aspect}'
                raise TriggerLoopError(
                    f'Setting the same aspect that triggered: {trigger_key}'
                )

        regex = isinstance(identity, typing.Pattern)

        if regex:
            identity = identity.pattern

        await self.websocket.send_json({
            'kind': 'set-aspect',
            'identity': str(identity),
            'regex': regex,
            'payload': prepare_aspects(aspects)
        })

    async def get_aspect(self, identity: str, aspect: str):
        """
        Request the value of an aspect from the frontend.

        :param identity: Component to get aspect from.
        :param aspect: Name of the aspect property.
        :return:
        """

        response_queue = asyncio.Queue()

        await self._request_queue.put({
            'request_id': uuid.uuid4().hex,
            'queue': response_queue,
            'identity': identity,
            'aspect': aspect,
            'kind': 'get-aspect'
        })

        value, error = await response_queue.get()
        if value is UNDEFINED:
            raise GetAspectError(
                error or f'Undefined aspect {aspect}@{identity}'
            )

        return hydrate(value)

    async def _get_storage(self, storage, identity):
        response_queue = asyncio.Queue()

        await self._request_queue.put({
            'request_id': uuid.uuid4().hex,
            'queue': response_queue,
            'identity': identity,
            'storage': storage,
            'kind': 'get-storage'
        })

        value, error = await response_queue.get()
        if error is not UNDEFINED:
            raise error

        return value

    async def _set_storage(self, storage, identity, payload):
        await self._request_queue.put({
            'request_id': uuid.uuid4().hex,
            'identity': identity,
            'kind': 'set-storage',
            'storage': storage,
            'payload': payload
        })

    async def get_local_storage(self, identity):
        return await self._get_storage('local', identity)

    async def set_local_storage(self, identity, payload):
        await self._set_storage('local', identity, payload)

    async def get_session_storage(self, identity):
        return await self._get_storage('session', identity)

    async def set_session_storage(self, identity, payload):
        await self._set_storage('session', identity, payload)


# Decorator
class Binding:
    """Bind a function to execute when the trigger aspect change."""
    def __init__(
            self,
            trigger: Trigger,
            states: StateList = None,
            call: bool = False,
    ):
        self.trigger = trigger
        self.states = states or []
        self.call = call

    def __call__(self, func):

        @functools.wraps(func)
        async def bound(request, data, ws, request_queue, create_task):
            trigger = BoundValue(
                data['trigger']['identity'],
                data['trigger']['aspect'],
                hydrate(data['trigger'].get('value'))
            )
            states = {}
            for state in data['states']:
                component = states.setdefault(state['identity'], {})
                component[state['aspect']] = hydrate(
                    state.get('value', UNDEFINED)
                )

            if self.call:
                context = CallContext(
                    trigger.identity,
                    request,
                    trigger,
                    states,
                )
            else:
                context = BindingContext(
                    trigger.identity,
                    request,
                    trigger,
                    states,
                    ws,
                    request_queue,
                    create_task
                )
            await func(context)
            return context

        return BoundAspect(bound, self.trigger, self.states, self.call)


def coerce_binding(value, binding_type: typing.Type = Trigger):

    if isinstance(value, list):
        return [coerce_binding(x, binding_type) for x in value]

    if isinstance(value, binding_type):
        return value

    if isinstance(value, str):

        splat = value.split('@')
        if not len(splat) == 2:
            raise BindingError(f'Invalid {binding_type.__name__}: {value}')

        return binding_type(identity=splat[1], aspect=splat[0])

    raise BindingError(f'Invalid {binding_type.__name__}: {value}')


class CallContext(BaseContext):
    """
    Context of a call binding is used to set aspects on a request.
    """
    def __init__(
        self,
        identity: str,
        request: web.Request,
        trigger: BoundValue,
        states: typing.Dict[str, BoundValue],
    ):
        super().__init__(identity, request, trigger, states)
        self._output = {}

    def set_aspect(self, identity, **aspects):
        self._output.setdefault(identity, {})

        if identity == self.trigger.identity:
            if self.trigger.aspect in set(aspects.keys()):
                raise TriggerLoopError(
                    'Setting the same aspect that triggered: '
                    f'{self.trigger.aspect}@{identity}'
                )
        self._output[identity].update(aspects)
