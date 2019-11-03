import React from 'react';
import PropTypes from 'prop-types';
import {apiRequest} from '../requests';
import {
    hydrateComponent,
    hydrateProps,
    isComponent,
    prepareProp,
} from '../hydrator';
import {loadRequirement, loadRequirements} from '../requirements';
import {disableCss} from '../../../commons/js/utils';

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
            reloading: false,
            needRefresh: false,
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
            case 'reload':
                const {filenames, hot, refresh, deleted} = data;
                if (refresh) {
                    return this.setState({reloading: true, needRefresh: true});
                }
                if (hot) {
                    // The ws connection will close, when it
                    // reconnect it will do a hard reload of the page api.
                    return this.setState({reloading: true});
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

    _connectWS() {
        // Setup websocket for updates
        let tries = 0;
        let hardClose = false;
        const connexion = () => {
            this.ws = new WebSocket(
                `ws${
                    window.location.href.startsWith('https') ? 's' : ''
                }://${(this.props.baseUrl && this.props.baseUrl) ||
                    window.location.host}${window.location.pathname}/ws`
            );
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

    componentWillMount() {
        this.pageApi('', {method: 'POST'}).then(response => {
            this.setState({
                page: response.page,
                layout: response.layout,
                bindings: response.bindings,
                packages: response.packages,
                requirements: response.requirements,
            });
            loadRequirements(response.requirements, response.packages).then(
                () => {
                    if (
                        Object.keys(response.bindings).length ||
                        response.reload
                    ) {
                        this._connectWS();
                    } else {
                        this.setState({ready: true});
                    }
                }
            );
        });
    }

    render() {
        const {layout, ready, reloading} = this.state;
        if (!ready) {
            return <div className="dazzler-loading">Loading...</div>;
        }
        if (reloading) {
            return <div className="dazzler-loading">Reloading...</div>;
        }
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
    hotReload: PropTypes.func,
};
