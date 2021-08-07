import React from 'react';
import {DazzlerProps} from '../../../commons/js/types';

type ContainerProps = {
    children?: JSX.Element;
    /**
     * Native html attribute to show a little yellow textual popover.
     */
    title?: string;

    draggable?: boolean;

    /**
     * Number of times the container was clicked.
     */
    clicks?: number;
    id?: string;
} & DazzlerProps;

/**
 * Virtual div
 *
 * :CSS:
 *
 *     - ``dazzler-core-container``.
 *     - ``scroll``
 *     - ``flex``
 *     - ``row``
 *     - ``column``
 *     - ``btn``
 *     - ``center``
 *     - ``hidden``
 */
export default class Container extends React.Component<ContainerProps> {
    shouldComponentUpdate(nextProps) {
        // Ignore virtual n_clicks don't need a re-render of
        // the whole children.
        return !(this.props.clicks < nextProps.clicks);
    }

    render() {
        const {id, class_name, style, children, title, identity, draggable} =
            this.props;
        return (
            <div
                id={id || identity}
                className={class_name}
                style={style}
                title={title}
                draggable={draggable}
                onClick={() => {
                    this.props.updateAspects({
                        clicks: this.props.clicks + 1,
                    });
                }}
            >
                {children}
            </div>
        );
    }

    static defaultProps = {
        clicks: 0,
    };
}
