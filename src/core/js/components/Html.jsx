import React from 'react';
import PropTypes from 'prop-types';
import {type, map} from 'ramda';
import {camelToSnakeCase} from '../../../commons/js';

function prepareType(obj) {
    switch (type(obj)) {
        case 'String':
        case 'Number':
        case 'Boolean':
        case 'Null':
            return obj;
        case 'Array':
            return obj.map(prepareType).filter(e => type(e) !== 'Undefined');
        case 'Object':
            return map(prepareObject, obj);
        default:
            return;
    }
}

function prepareObject(obj) {
    const payload = {};

    for (let k in obj) {
        // noinspection JSUnfilteredForInLoop
        if (!k.startsWith('_')) {
            // noinspection JSUnfilteredForInLoop
            payload[camelToSnakeCase(k)] = prepareType(obj[k]);
        }
    }

    return payload;
}

/**
 * Html tag wrapper, give any props as ``attributes``.
 * Listen to events with the readonly event aspect containing the
 * latest event fired.
 */
export default class Html extends React.Component {
    constructor(props) {
        super(props);
        this.onEvent = this.onEvent.bind(this);
    }

    componentDidMount() {
        if (this.props.events) {
            this.props.events.forEach(e => {
                this.element.addEventListener(e, this.onEvent);
            });
        }
    }

    componentWillUnmount() {
        if (this.props.events) {
            this.props.events.forEach(e => {
                this.element.removeEventListener(e, this.onEvent);
            });
        }
    }

    onEvent(e) {
        this.props.updateAspects({
            event: {
                name: e.name,
                ...prepareObject(e),
            },
        });
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        // Ignore virtual event don't need a re-render of
        // the whole children.
        return !(this.props.event !== nextProps.event);
    }

    render() {
        const {
            tag,
            id,
            class_name,
            attributes,
            identity,
            children,
        } = this.props;
        return React.createElement(tag, {
            id: id || identity,
            className: class_name,
            children: children,
            ...attributes,
            ref: r => (this.element = r),
        });
    }
}

Html.defaultProps = {};

Html.propTypes = {
    /**
     * Tag name of the component.
     */
    tag: PropTypes.string.isRequired,

    /**
     * Children of the html tag.
     */
    children: PropTypes.node,
    /**
     * Id of the element in DOM.
     */
    id: PropTypes.string,
    /**
     * Class of the element.
     */
    class_name: PropTypes.string,
    /**
     * Any other html attributes relevant to the html tag
     */
    attributes: PropTypes.object,

    /**
     * Events to subscribe.
     */
    events: PropTypes.array,

    /**
     * Last event fired.
     */
    event: PropTypes.object,

    identity: PropTypes.string,

    /**
     * Update aspects on the backend.
     */
    updateAspects: PropTypes.func,
};
