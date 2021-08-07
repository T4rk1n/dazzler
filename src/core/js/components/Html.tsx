import React from 'react';
import {type, map} from 'ramda';
import {camelToSnakeCase} from 'commons';
import {AnyDict, DazzlerProps} from '../../../commons/js/types';

type HtmlProps = {
    /**
     * Tag name of the component.
     */
    tag: string;

    /**
     * Children of the html tag.
     */
    children?: JSX.Element;
    /**
     * Id of the element in DOM.
     */
    id?: string;
    /**
     * Any other html attributes relevant to the html tag
     */
    attributes?: AnyDict;

    /**
     * Events to subscribe.
     */
    events?: string[];

    /**
     * Last event fired.
     */
    event?: object;
} & DazzlerProps;

function prepareType(obj) {
    switch (type(obj)) {
        case 'String':
        case 'Number':
        case 'Boolean':
        case 'Null':
            return obj;
        case 'Array':
            return obj.map(prepareType).filter((e) => type(e) !== 'Undefined');
        case 'Object':
            return map(prepareObject, obj);
        default:
            return null;
    }
}

function prepareObject(obj) {
    const payload = {};

    for (const k in obj) {
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
export default class Html extends React.Component<HtmlProps> {
    element: Element;
    constructor(props) {
        super(props);
        this.onEvent = this.onEvent.bind(this);
    }

    componentDidMount() {
        if (this.props.events) {
            this.props.events.forEach((e) => {
                this.element.addEventListener(e, this.onEvent);
            });
        }
    }

    componentWillUnmount() {
        if (this.props.events) {
            this.props.events.forEach((e) => {
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

    shouldComponentUpdate(nextProps) {
        // Ignore virtual event don't need a re-render of
        // the whole children.
        return !(this.props.event !== nextProps.event);
    }

    render() {
        const {tag, id, class_name, attributes, identity, children} =
            this.props;
        return React.createElement(tag, {
            id: id || identity,
            className: class_name,
            children: children,
            ...attributes,
            ref: (r) => (this.element = r),
        });
    }
}
