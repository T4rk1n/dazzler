import React from 'react';
import {apiRequest} from '../requests';
import {
    hydrateComponent,
    hydrateProps,
    isComponent,
    prepareProp,
} from '../hydrator';
import {loadRequirement, loadRequirements} from '../requirements';
import {disableCss} from 'commons';
import {pickBy, keys, map, evolve, concat, flatten} from 'ramda';
import {executeTransform} from '../transforms';
import {
    Binding,
    BoundComponents,
    EvolvedBinding,
    UpdaterProps,
    UpdaterState,
} from '../types';

export default class Updater extends React.Component<
    UpdaterProps,
    UpdaterState
> {
    private pageApi: Function;
    private readonly boundComponents: BoundComponents;
    private ws: WebSocket;

    constructor(props) {
        super(props);
        this.state = {
            layout: null,
            ready: false,
            page: null,
            bindings: {},
            packages: [],
            reload: false,
            rebindings: [],
            requirements: [],
            reloading: false,
            needRefresh: false,
            ties: {},
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

    updateAspects(identity, aspects) {
        return new Promise(resolve => {
            const aspectKeys = keys(aspects);
            let bindings: Binding[] | EvolvedBinding[] = aspectKeys
                .map((key: string) => ({
                    ...this.state.bindings[`${key}@${identity}`],
                    value: aspects[key],
                }))
                .filter(e => e.trigger);

            this.state.rebindings.forEach(binding => {
                if (binding.trigger.identity.test(identity)) {
                    // @ts-ignore
                    bindings = concat(
                        bindings,
                        aspectKeys
                            .filter((k: string) =>
                                binding.trigger.aspect.test(k)
                            )
                            .map(k => ({
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

            flatten(
                aspectKeys.map(key => {
                    const ties = [];
                    for (let i = 0; i < this.state.ties.length; i++) {
                        const tie = this.state.ties[i];
                        const {trigger} = tie;
                        if (
                            (trigger.regex &&
                                trigger.identity.test(identity) &&
                                trigger.aspect.test(key)) ||
                            (trigger.identity === identity &&
                                trigger.aspect === key)
                        ) {
                            ties.push({
                                ...tie,
                                value: aspects[key],
                            });
                        }
                    }
                    return ties;
                })
            ).forEach(tie => {
                const {transforms} = tie;
                let value = tie.value;
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

                tie.targets.forEach(t => {
                    const component = this.boundComponents[t.identity];
                    if (component) {
                        component.updateAspects({[t.aspect]: value});
                    }
                });
            });

            if (!bindings) {
                resolve(0);
            } else {
                bindings.forEach(binding =>
                    this.sendBinding(binding, binding.value)
                );
                resolve(bindings.length);
            }
        });
    }

    getAspect(identity, aspect): any | undefined {
        const c = this.boundComponents[identity];
        if (c) {
            return c.getAspect(aspect);
        }
        return undefined;
    }

    connect(identity, setAspects, getAspect, matchAspects, updateAspects) {
        this.boundComponents[identity] = {
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
                const setAspects = component =>
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
                        .map(k => this.boundComponents[k])
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
                deleted.forEach(r => disableCss(r.url));
                break;
            case 'ping':
                // Just do nothing.
                break;
        }
    }

    sendBinding(binding, value) {
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
        this.ws.send(JSON.stringify(payload));
    }

    _connectWS() {
        // Setup websocket for updates
        let tries = 0;
        let hardClose = false;
        const connexion = () => {
            const url = `ws${
                window.location.href.startsWith('https') ? 's' : ''
            }://${(this.props.baseUrl && this.props.baseUrl) ||
                window.location.host}/${this.state.page}/ws`;
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
        this.pageApi('', {method: 'POST'}).then(response => {
            const toRegex = x => new RegExp(x);
            this.setState(
                {
                    page: response.page,
                    layout: response.layout,
                    bindings: pickBy(b => !b.regex, response.bindings),
                    // Regex bindings triggers
                    rebindings: map(x => {
                        const binding = response.bindings[x];
                        binding.trigger = evolve(
                            {
                                identity: toRegex,
                                aspect: toRegex,
                            },
                            binding.trigger
                        );
                        return binding;
                    }, keys(pickBy(b => b.regex, response.bindings))),
                    packages: response.packages,
                    requirements: response.requirements,
                    ties: map(tie => {
                        if (tie.trigger.regex) {
                            return evolve(
                                {trigger: {identity: toRegex, aspect: toRegex}},
                                tie
                            );
                        }
                        return tie;
                    }, response.ties),
                },
                () =>
                    loadRequirements(
                        response.requirements,
                        response.packages
                    ).then(() => {
                        if (keys(response.bindings).length || response.reload) {
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
        if (!isComponent(layout)) {
            throw new Error(`Layout is not a component: ${layout}`);
        }

        const contexts = [];

        const onContext = contextComponent => {
            contexts.push(contextComponent);
        };

        const hydrated = hydrateComponent(
            layout.name,
            layout.package,
            layout.identity,
            hydrateProps(
                layout.aspects,
                this.updateAspects,
                this.connect,
                this.disconnect,
                onContext
            ),
            this.updateAspects,
            this.connect,
            this.disconnect,
            onContext
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
