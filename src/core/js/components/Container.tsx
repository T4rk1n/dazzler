import React from 'react';
import {
    CommonPresetsProps,
    CommonStyleProps,
    DazzlerProps,
} from '../../../commons/js/types';
import {getCommonStyles, getPresetsClassNames} from 'commons';

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
} & DazzlerProps &
    CommonStyleProps &
    CommonPresetsProps;

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
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    shouldComponentUpdate(nextProps) {
        // Ignore virtual clicks don't need a re-render of
        // the whole children.
        return !(this.props.clicks < nextProps.clicks);
    }

    onClick() {
        this.props.updateAspects({
            clicks: this.props.clicks + 1,
        });
    }

    render() {
        const {id, class_name, style, children, title, identity, draggable} =
            this.props;
        const css = getPresetsClassNames(this.props, class_name);
        const styles = getCommonStyles(this.props, style);

        return (
            <div
                id={id || identity}
                className={css}
                style={styles}
                title={title}
                draggable={draggable}
                onClick={this.onClick}
            >
                {children}
            </div>
        );
    }

    static defaultProps = {
        clicks: 0,
    };
}
