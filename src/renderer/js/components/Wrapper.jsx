import React from 'react';
import PropTypes from 'prop-types';
import {concat, join} from 'ramda';
import {camelToSpinal} from 'commons';

/**
 * Wraps components for aspects updating.
 */
export default class Wrapper extends React.Component {
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
    }

    updateAspects(aspects) {
        return this.setAspects(aspects).then(() =>
            this.props.updateAspects(this.props.identity, aspects)
        );
    }

    setAspects(aspects) {
        return new Promise(resolve => {
            this.setState(
                {aspects: {...this.state.aspects, ...aspects}},
                resolve
            );
        });
    }

    getAspect(aspect) {
        return this.state.aspects[aspect];
    }

    componentDidMount() {
        // Only update the component when mounted.
        // Otherwise gets a race condition with willUnmount
        this.props.connect(
            this.props.identity,
            this.setAspects,
            this.getAspect
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

Wrapper.propTypes = {
    identity: PropTypes.string.isRequired,
    updateAspects: PropTypes.func.isRequired,
    component: PropTypes.node.isRequired,
    connect: PropTypes.func.isRequired,
    component_name: PropTypes.string.isRequired,
    package_name: PropTypes.string.isRequired,
    disconnect: PropTypes.func.isRequired,
};
