import React from 'react';
import PropTypes from 'prop-types';
import {merge, type, omit, map} from 'ramda';
import Wrapper from './Wrapper';
import {apiRequest} from '../requests';
import {loadCss, loadScript} from '../../../commons/js';

function isComponent(c) {
    return (
        type(c) === 'Object' &&
        (c.hasOwnProperty('package') &&
            c.hasOwnProperty('aspects') &&
            c.hasOwnProperty('name') &&
            c.hasOwnProperty('identity'))
    );
}

function hydrateProps(props, updateAspects, connect, disconnect) {
    const replace = {};
    Object.entries(props).forEach(([k, v]) => {
        if (type(v) === 'Array') {
            replace[k] = v.map(c => {
                if (!isComponent(c)) {
                    // Mixing components and primitives
                    return c;
                }
                const newProps = hydrateProps(
                    c.aspects,
                    updateAspects,
                    connect,
                    disconnect
                );
                if (!newProps.key) {
                    newProps.key = c.identity;
                }
                return hydrateComponent(
                    c.name,
                    c.package,
                    c.identity,
                    newProps,
                    updateAspects,
                    connect,
                    disconnect
                );
            });
        } else if (isComponent(v)) {
            const newProps = hydrateProps(
                v.aspects,
                updateAspects,
                connect,
                disconnect
            );
            replace[k] = hydrateComponent(
                v.name,
                v.package,
                v.identity,
                newProps,
                updateAspects,
                connect,
                disconnect
            );
        } else if (type(v) === 'Object') {
            replace[k] = hydrateProps(v, updateAspects, connect, disconnect);
        }
    });
    return merge(props, replace);
}

function hydrateComponent(
    name,
    package_name,
    identity,
    props,
    updateAspects,
    connect,
    disconnect
) {
    const pack = window[package_name];
    const element = React.createElement(pack[name], props);
    return (
        <Wrapper
            identity={identity}
            updateAspects={updateAspects}
            component={element}
            connect={connect}
            package_name={package_name}
            component_name={name}
            aspects={props}
            disconnect={disconnect}
            key={`wrapper-${identity}`}
        />
    );
}

function prepareProp(prop) {
    if (React.isValidElement(prop)) {
        return {
            identity: prop.props.identity,
            aspects: map(
                prepareProp,
                omit(
                    [
                        'identity',
                        'updateAspects',
                        '_name',
                        '_package',
                        'aspects',
                        'key',
                    ],
                    prop.props.aspects // You actually in the wrapper here.
                )
            ),
            name: prop.props.component_name,
            package: prop.props.package_name,
        };
    }
    if (type(prop) === 'Array') {
        return prop.map(prepareProp);
    }
    if (type(prop) === 'Object') {
        return map(prepareProp, prop);
    }
    return prop;
}

export default class Updater extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            layout: false,
            ready: false,
            page: null,
            bindings: {},
            packages: [],
            requirements: [],
        };
        // The api url for the page is the same but a post.
        // Fetch bindings, packages & requirements
        this.pageApi = apiRequest(
            this.getHeaders.bind(this),
            this.refresh.bind(this),
            window.location.href
        );
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
            const bindings = Object.keys(aspects)
                .map(key => this.state.bindings[`${identity}.${key}`])
                .filter(e => e);

            if (!bindings) {
                return resolve(0);
            }

            bindings.forEach(binding =>
                this.sendBinding(binding, aspects[binding.trigger.aspect])
            );
            resolve();
        });
    }

    connect(identity, setAspects, getAspect) {
        this.boundComponents[identity] = {
            setAspects,
            getAspect,
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
                const component = this.boundComponents[identity];
                if (!component) {
                    const error = `Component not found: ${identity}`;
                    this.ws.send(JSON.stringify({error, kind: 'error'}));
                    console.error(error);
                    return;
                }

                component
                    .setAspects(
                        hydrateProps(
                            payload,
                            this.updateAspects,
                            this.connect,
                            this.disconnect
                        )
                    )
                    .then(() => {
                        Object.keys(payload).forEach(k => {
                            const key = `${identity}.${k}`;
                            const binding = this.state.bindings[key];
                            if (binding) {
                                this.sendBinding(
                                    binding,
                                    component.getAspect(k)
                                );
                            }
                            // What about returned components ?
                            // They get their Wrapper.
                        });
                    });
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
        const states = binding.states.map(state => ({
            ...state,
            value:
                this.boundComponents[state.identity] &&
                prepareProp(
                    this.boundComponents[state.identity].getAspect(state.aspect)
                ),
        }));

        const payload = {
            trigger,
            states,
            kind: 'binding',
            page: this.state.page,
            key: binding.key,
        };
        this.ws.send(JSON.stringify(payload));
    }

    loadRequirements(requirements, packages) {
        return new Promise((resolve, reject) => {
            let loadings = [];
            // Load packages first.
            Object.keys(packages).forEach(pack_name => {
                const pack = packages[pack_name];
                loadings = loadings.concat(
                    pack.requirements.map(this.loadRequirement)
                );
            });
            // Then load requirements so they can use packages
            // and override css.
            Promise.all(loadings)
                .then(() => {
                    let i = 0;
                    // Load in order.
                    const handler = () => {
                        if (i < requirements.length) {
                            this.loadRequirement(requirements[i]).then(() => {
                                i++;
                                handler();
                            });
                        } else {
                            resolve();
                        }
                    };
                    handler();
                })
                .catch(reject);
        });
    }

    loadRequirement(requirement) {
        return new Promise((resolve, reject) => {
            const {url, kind, meta} = requirement;
            let method;
            if (kind === 'js') {
                method = loadScript;
            } else if (kind === 'css') {
                method = loadCss;
            } else if (kind === 'map') {
                return resolve();
            } else {
                return reject({error: `Invalid requirement kind: ${kind}`});
            }
            method(url, meta)
                .then(resolve)
                .catch(reject);
        });
    }

    _connectWS() {
        // Setup websocket for updates
        let tries = 0;
        const connexion = () => {
            this.ws = new WebSocket(
                `ws${
                    window.location.href.startsWith('https') ? 's' : ''
                }://${(this.props.baseUrl && this.props.baseUrl) ||
                    window.location.host}${window.location.pathname}/ws`
            );
            this.ws.addEventListener('message', this.onMessage);
            this.ws.onopen = () => {
                this.setState({ready: true});
                tries = 0;
            };
            this.ws.onclose = () => {
                const reconnect = () => {
                    try {
                        tries++;
                        connexion();
                    } catch (e) {
                        if (tries < this.props.retries) {
                            setTimeout(reconnect, 1000);
                        }
                    }
                };
                setTimeout(reconnect, 1000);
            };
        };
        connexion();
    }

    // TODO implement or remove dependence on these functions.
    getHeaders() {
        return {};
    }
    refresh() {}

    componentWillMount() {
        this.pageApi('', {method: 'POST'}).then(response => {
            this.setState({
                page: response.page,
                layout: response.layout,
                bindings: response.bindings,
                packages: response.packages,
                requirements: response.requirements,
            });
            this.loadRequirements(
                response.requirements,
                response.packages
            ).then(() => this._connectWS());
        });
    }

    render() {
        const {layout, ready} = this.state;
        if (!ready) return <div>Loading...</div>;
        if (!isComponent(layout)) {
            throw new Error(`Layout is not a component: ${layout}`);
        }

        return (
            <div className="dazzler-rendered">
                {hydrateComponent(
                    layout.name,
                    layout.package,
                    layout.identity,
                    hydrateProps(
                        layout.aspects,
                        this.updateAspects,
                        this.connect,
                        this.disconnect
                    ),
                    this.updateAspects,
                    this.connect,
                    this.disconnect
                )}
            </div>
        );
    }
}

Updater.defaultProps = {};

Updater.propTypes = {
    baseUrl: PropTypes.string.isRequired,
    ping: PropTypes.bool,
    ping_interval: PropTypes.number,
    retries: PropTypes.number,
};
