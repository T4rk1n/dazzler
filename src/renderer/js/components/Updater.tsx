import React from 'react';
import {apiRequest} from '../requests';
import {hydrateComponent, hydrateProps, prepareProp} from '../hydrator';
import {loadRequirement, loadRequirements} from '../requirements';
import {disableCss} from 'commons';
import {
    pickBy,
    keys,
    map,
    evolve,
    concat,
    flatten,
    dissoc,
    zip,
    all,
    toPairs,
    values as rValues,
    propSatisfies,
    not,
    assoc,
    pipe,
    propEq,
} from 'ramda';
import {executeTransform} from '../transforms';
import {
    Binding,
    BoundComponents,
    CallOutput,
    EvolvedBinding,
    ApiFunc,
    Tie,
    UpdaterProps,
    UpdaterState,
    PageApiResponse,
    Aspect,
} from '../types';
import {getAspectKey, isSameAspect} from '../aspects';

export default class Updater extends React.Component<
    UpdaterProps,
    UpdaterState
> {
    private pageApi: ApiFunc;
    private readonly boundComponents: BoundComponents;
    private ws: WebSocket;

    constructor(props) {
        super(props);
        this.state = {
            layout: null,
            ready: false,
            page: null,
            bindings: {},
            packages: {},
            reload: false,
            rebindings: [],
            requirements: [],
            reloading: false,
            needRefresh: false,
            ties: [],
        };
        // The api url for the page is the same but a post.
        // Fetch bindings, packages & requirements
        this.pageApi = apiRequest(window.location.href);
        // All components get connected.
        this.boundComponents = {};
        this.ws = null;

        this.updateAspects = this.updateAspects.bind(this);
        this.connect = this.connect.bind(this);
        this.disconnect = this.disconnect.bind(this);
        this.onMessage = this.onMessage.bind(this);
    }

    updateAspects(identity: string, aspects, initial = false) {
        return new Promise<number>((resolve) => {
            const aspectKeys: string[] = keys<string>(aspects);
            let bindings: Binding[] | EvolvedBinding[] = aspectKeys
                .map((key: string) => ({
                    ...this.state.bindings[getAspectKey(identity, key)],
                    value: aspects[key],
                }))
                .filter(
                    (e) => e.trigger && !(e.trigger.skip_initial && initial)
                );

            this.state.rebindings.forEach((binding) => {
                if (
                    binding.trigger.identity.test(identity) &&
                    !(binding.trigger.skip_initial && initial)
                ) {
                    // @ts-ignore
                    bindings = concat(
                        bindings,
                        aspectKeys
                            .filter((k: string) =>
                                binding.trigger.aspect.test(k)
                            )
                            .map((k) => ({
                                ...binding,
                                value: aspects[k],
                                trigger: {
                                    ...binding.trigger,
                                    identity,
                                    aspect: k,
                                },
                            }))
                    );
                }
            });

            const removableTies = [];

            flatten(
                aspectKeys.map((aspect) => {
                    const ties = [];
                    for (let i = 0; i < this.state.ties.length; i++) {
                        const tie = this.state.ties[i];
                        const {trigger} = tie;
                        if (
                            !(trigger.skip_initial && initial) &&
                            ((trigger.regex &&
                                // @ts-ignore
                                trigger.identity.test(identity) &&
                                // @ts-ignore
                                trigger.aspect.test(aspect)) ||
                                isSameAspect(trigger, {identity, aspect}))
                        ) {
                            ties.push({
                                ...tie,
                                value: aspects[aspect],
                            });
                        }
                    }
                    return ties;
                })
            ).forEach((tie: Tie) => {
                const {transforms} = tie;
                let value = tie.value;

                if (tie.trigger.once) {
                    removableTies.push(tie);
                }

                if (transforms) {
                    value = transforms.reduce((acc, e) => {
                        return executeTransform(
                            e.transform,
                            acc,
                            e.args,
                            e.next,
                            this.getAspect.bind(this)
                        );
                    }, value);
                }

                tie.targets.forEach((t: Aspect) => {
                    const component = this.boundComponents[t.identity];
                    if (component) {
                        component.updateAspects({[t.aspect]: value});
                    }
                });

                if (tie.regexTargets.length) {
                    // FIXME probably a more efficient way to do this
                    //  refactor later.
                    rValues(this.boundComponents).forEach((c) => {
                        tie.regexTargets.forEach((t) => {
                            if ((t.identity as RegExp).test(c.identity)) {
                                c.updateAspects({[t.aspect as string]: value});
                            }
                        });
                    });
                }
            });

            if (removableTies.length) {
                this.setState({
                    ties: this.state.ties.filter(
                        (t) =>
                            !removableTies.reduce(
                                (acc, tie) =>
                                    acc ||
                                    (isSameAspect(t.trigger, tie.trigger) &&
                                        all(([t1, t2]) => isSameAspect(t1, t2))(
                                            zip(t.targets, tie.targets)
                                        )),
                                false
                            )
                    ),
                });
            }

            if (!bindings) {
                resolve(0);
            } else {
                const removableBindings = [];
                bindings.forEach((binding) => {
                    this.sendBinding(binding, binding.value, binding.call);
                    if (binding.trigger.once) {
                        removableBindings.push(binding);
                    }
                });
                if (removableBindings.length) {
                    this.setState({
                        bindings: removableBindings.reduce(
                            (acc, binding) =>
                                dissoc(
                                    getAspectKey(
                                        binding.trigger.identity,
                                        binding.trigger.aspect
                                    ),
                                    acc
                                ),
                            this.state.bindings
                        ),
                    });
                }
                // Promise is for wrapper ready
                // TODO investigate reasons/uses of length resolve?
                resolve(bindings.length);
            }
        });
    }

    getAspect<T>(identity: string, aspect: string): T | undefined {
        const c = this.boundComponents[identity];
        if (c) {
            return c.getAspect(aspect);
        }
        return undefined;
    }

    connect(identity, setAspects, getAspect, matchAspects, updateAspects) {
        this.boundComponents[identity] = {
            identity,
            setAspects,
            getAspect,
            matchAspects,
            updateAspects,
        };
    }

    disconnect(identity) {
        delete this.boundComponents[identity];
    }

    onMessage(response) {
        const data = JSON.parse(response.data);
        const {identity, kind, payload, storage, request_id} = data;
        let store;
        if (storage === 'session') {
            store = window.sessionStorage;
        } else {
            store = window.localStorage;
        }
        switch (kind) {
            case 'set-aspect':
                const setAspects = (component) =>
                    component
                        .setAspects(
                            hydrateProps(
                                payload,
                                this.updateAspects,
                                this.connect,
                                this.disconnect
                            )
                        )
                        .then(() => this.updateAspects(identity, payload));
                if (data.regex) {
                    const pattern = new RegExp(data.identity);
                    keys(this.boundComponents)
                        .filter((k: string) => pattern.test(k))
                        .map((k) => this.boundComponents[k])
                        .forEach(setAspects);
                } else {
                    setAspects(this.boundComponents[identity]);
                }
                break;
            case 'get-aspect':
                const {aspect} = data;
                const wanted = this.boundComponents[identity];
                if (!wanted) {
                    this.ws.send(
                        JSON.stringify({
                            kind,
                            identity,
                            aspect,
                            request_id,
                            error: `Aspect not found ${identity}.${aspect}`,
                        })
                    );
                    return;
                }
                const value = wanted.getAspect(aspect);
                this.ws.send(
                    JSON.stringify({
                        kind,
                        identity,
                        aspect,
                        value: prepareProp(value),
                        request_id,
                    })
                );
                break;
            case 'set-storage':
                store.setItem(identity, JSON.stringify(payload));
                break;
            case 'get-storage':
                this.ws.send(
                    JSON.stringify({
                        kind,
                        identity,
                        request_id,
                        value: JSON.parse(store.getItem(identity)),
                    })
                );
                break;
            case 'reload':
                const {filenames, hot, refresh, deleted} = data;
                if (refresh) {
                    this.ws.close();
                    this.setState({reloading: true, needRefresh: true});
                    return;
                }
                if (hot) {
                    // The ws connection will close, when it
                    // reconnect it will do a hard reload of the page api.
                    this.setState({reloading: true});
                    return;
                }
                filenames.forEach(loadRequirement);
                deleted.forEach((r) => disableCss(r.url));
                break;
            case 'ping':
                // Just do nothing.
                break;
        }
    }

    sendBinding(binding, value, call = false) {
        // Collect all values and send a binding payload
        const trigger = {
            ...binding.trigger,
            value: prepareProp(value),
        };
        const states = binding.states.reduce((acc, state) => {
            if (state.regex) {
                const identityPattern = new RegExp(state.identity);
                const aspectPattern = new RegExp(state.aspect);
                return concat(
                    acc,
                    flatten(
                        keys(this.boundComponents).map((k: string) => {
                            let values = [];
                            if (identityPattern.test(k)) {
                                values = this.boundComponents[k]
                                    .matchAspects(aspectPattern)
                                    .map(([name, val]) => ({
                                        ...state,
                                        identity: k,
                                        aspect: name,
                                        value: prepareProp(val),
                                    }));
                            }
                            return values;
                        })
                    )
                );
            }

            acc.push({
                ...state,
                value:
                    this.boundComponents[state.identity] &&
                    prepareProp(
                        this.boundComponents[state.identity].getAspect(
                            state.aspect
                        )
                    ),
            });
            return acc;
        }, []);

        const payload = {
            trigger,
            states,
            kind: 'binding',
            page: this.state.page,
            key: binding.key,
        };
        if (call) {
            this.callBinding(payload);
        } else {
            this.ws.send(JSON.stringify(payload));
        }
    }

    callBinding(payload) {
        this.pageApi<CallOutput>('', {
            method: 'PATCH',
            payload,
            json: true,
        }).then((response) => {
            toPairs(response.output).forEach(([identity, aspects]) => {
                const component = this.boundComponents[identity];
                if (component) {
                    component.updateAspects(
                        hydrateProps(
                            aspects,
                            this.updateAspects,
                            this.connect,
                            this.disconnect
                        )
                    );
                }
            });
        });
    }

    _connectWS() {
        // Setup websocket for updates
        let tries = 0;
        let hardClose = false;
        const connexion = () => {
            const url = `ws${
                window.location.href.startsWith('https') ? 's' : ''
            }://${
                (this.props.baseUrl && this.props.baseUrl) ||
                window.location.host
            }/${this.state.page}/ws`;
            this.ws = new WebSocket(url);
            this.ws.addEventListener('message', this.onMessage);
            this.ws.onopen = () => {
                if (this.state.reloading) {
                    hardClose = true;
                    this.ws.close();
                    if (this.state.needRefresh) {
                        window.location.reload();
                    } else {
                        this.props.hotReload();
                    }
                } else {
                    this.setState({ready: true});
                    tries = 0;
                }
            };
            this.ws.onclose = () => {
                const reconnect = () => {
                    tries++;
                    connexion();
                };
                if (!hardClose && tries < this.props.retries) {
                    setTimeout(reconnect, 1000);
                }
            };
        };
        connexion();
    }

    componentDidMount() {
        this.pageApi<PageApiResponse>('', {method: 'POST'}).then((response) => {
            const toRegex = (x) => new RegExp(x);
            this.setState(
                {
                    page: response.page,
                    layout: response.layout,
                    bindings: pickBy((b) => !b.regex, response.bindings),
                    // Regex bindings triggers
                    rebindings: map((x) => {
                        const binding = response.bindings[x];
                        binding.trigger = evolve(
                            {
                                identity: toRegex,
                                aspect: toRegex,
                            },
                            binding.trigger
                        );
                        return binding;
                    }, keys(pickBy((b) => b.regex, response.bindings))),
                    packages: response.packages,
                    requirements: response.requirements,
                    // @ts-ignore
                    ties: map((tie) => {
                        const newTie = pipe(
                            assoc(
                                'targets',
                                tie.targets.filter(propSatisfies(not, 'regex'))
                            ),
                            assoc(
                                'regexTargets',
                                // @ts-ignore
                                tie.targets.filter(propEq('regex', true)).map(
                                    evolve({
                                        // Only match identity for targets.
                                        identity: toRegex,
                                    })
                                )
                            )
                        )(tie);

                        if (tie.trigger.regex) {
                            return evolve(
                                {
                                    trigger: {
                                        identity: toRegex,
                                        aspect: toRegex,
                                    },
                                },
                                newTie
                            );
                        }
                        return newTie;
                    }, response.ties),
                },
                () =>
                    loadRequirements(
                        response.requirements,
                        response.packages
                    ).then(() => {
                        if (
                            response.reload ||
                            rValues(response.bindings).filter(
                                (binding: Binding) => !binding.call
                            ).length
                        ) {
                            this._connectWS();
                        } else {
                            this.setState({ready: true});
                        }
                    })
            );
        });
    }

    render() {
        const {layout, ready, reloading} = this.state;
        if (!ready) {
            return (
                <div className="dazzler-loading-container">
                    <div className="dazzler-spin" />
                    <div className="dazzler-loading">Loading...</div>
                </div>
            );
        }
        if (reloading) {
            return (
                <div className="dazzler-loading-container">
                    <div className="dazzler-spin reload" />
                    <div className="dazzler-loading">Reloading...</div>
                </div>
            );
        }

        const contexts = [];

        const onContext = (contextComponent) => {
            contexts.push(contextComponent);
        };

        const hydrated = layout.map((component) =>
            hydrateComponent(
                component.name,
                component.package,
                component.identity,
                hydrateProps(
                    component.aspects,
                    this.updateAspects,
                    this.connect,
                    this.disconnect,
                    onContext
                ),
                this.updateAspects,
                this.connect,
                this.disconnect,
                onContext
            )
        );

        return (
            <div className="dazzler-rendered">
                {contexts.length
                    ? contexts.reduce((acc, Context) => {
                          if (!acc) {
                              return <Context>{hydrated}</Context>;
                          }
                          return <Context>{acc}</Context>;
                      }, null)
                    : hydrated}
            </div>
        );
    }
}
