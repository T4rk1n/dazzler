import React from 'react';
import {concat, join, keys} from 'ramda';
import {camelToSpinal} from 'commons';
import {WrapperProps, WrapperState} from '../types';

/**
 * Wraps components for aspects updating.
 */
export default class Wrapper extends React.Component<WrapperProps, WrapperState> {
    constructor(props) {
        super(props);
        this.state = {
            aspects: props.aspects || {},
            ready: false,
            initial: false,
        };
        this.setAspects = this.setAspects.bind(this);
        this.getAspect = this.getAspect.bind(this);
        this.updateAspects = this.updateAspects.bind(this);
        this.matchAspects = this.matchAspects.bind(this);
    }

    updateAspects(aspects) {
        return this.setAspects(aspects).then(() =>
            this.props.updateAspects(this.props.identity, aspects)
        );
    }

    setAspects(aspects) {
        return new Promise<void>(resolve => {
            this.setState(
                {aspects: {...this.state.aspects, ...aspects}},
                resolve
            );
        });
    }

    getAspect(aspect) {
        return this.state.aspects[aspect];
    }

    matchAspects(pattern) {
        return keys(this.state.aspects)
            .filter(k => pattern.test(k))
            .map(k => [k, this.state.aspects[k]]);
    }

    componentDidMount() {
        // Only update the component when mounted.
        // Otherwise gets a race condition with willUnmount
        this.props.connect(
            this.props.identity,
            this.setAspects,
            this.getAspect,
            this.matchAspects,
            this.updateAspects
        );
        if (!this.state.initial) {
            this.updateAspects(this.state.aspects).then(() =>
                this.setState({ready: true, initial: true})
            );
        }
    }

    componentWillUnmount() {
        this.props.disconnect(this.props.identity);
    }

    render() {
        const {component, component_name, package_name} = this.props;
        const {aspects, ready} = this.state;
        if (!ready) return null;

        return React.cloneElement(component, {
            ...aspects,
            updateAspects: this.updateAspects,
            identity: this.props.identity,
            class_name: join(
                ' ',
                concat(
                    [
                        `${package_name
                            .replace('_', '-')
                            .toLowerCase()}-${camelToSpinal(component_name)}`,
                    ],
                    aspects.class_name ? aspects.class_name.split(' ') : []
                )
            ),
        });
    }
}
