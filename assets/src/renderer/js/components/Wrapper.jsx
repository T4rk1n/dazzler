import React from 'react';
import PropTypes from 'prop-types';
import {concat, join} from 'ramda';

/**
 * Wraps components for aspects updating.
 */
export default class Wrapper extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            aspects: props.aspects || {},
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
        // Will mount gets a race condition with disconnect.
        this.props.connect(
            this.props.identity,
            this.setAspects,
            this.getAspect
        );
        this.updateAspects(this.props.aspects);
    }

    componentWillUnmount() {
        this.props.disconnect(this.props.identity);
    }

    render() {
        const {component, component_name, package_name} = this.props;
        const {aspects} = this.state;

        return React.cloneElement(component, {
            ...aspects,
            updateAspects: this.updateAspects,
            identity: this.props.identity,
            class_name: join(
                ' ',
                concat(
                    [
                        `${package_name
                            .slice(0, 3)
                            .toLowerCase()}-${component_name.toLowerCase()}`,
                    ],
                    aspects.class_name ? aspects.class_name.split(' ') : []
                )
            ),
            _name: component_name,
            _package: package_name,
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
