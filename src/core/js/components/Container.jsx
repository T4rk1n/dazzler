import React from 'react';
import PropTypes from 'prop-types';

/**
 * Virtual div
 */
export default class Container extends React.Component {
    shouldComponentUpdate(nextProps, nextState, nextContext) {
        // Ignore virtual n_clicks don't need a re-render of
        // the whole children.
        return !(this.props.clicks < nextProps.clicks);
    }

    render() {
        const {
            id,
            class_name,
            style,
            children,
            title,
            identity,
            draggable,
        } = this.props;
        return (
            <div
                id={id || identity}
                className={class_name}
                style={style}
                title={title}
                draggable={draggable}
                onClick={e => {
                    e.stopPropagation();
                    this.props.updateAspects({
                        clicks: this.props.clicks + 1,
                    });
                }}
            >
                {children}
            </div>
        );
    }
}

Container.defaultProps = {
    n_clicks: 0,
};

Container.propTypes = {
    children: PropTypes.node,
    id: PropTypes.string,
    class_name: PropTypes.string,
    style: PropTypes.object,

    title: PropTypes.string,

    draggable: PropTypes.bool,

    /**
     * Number of times the container was clicked.
     */
    clicks: PropTypes.number,

    /**
     *  Unique id for this component
     */
    identity: PropTypes.string,

    /**
     * Update aspects on the backend.
     */
    updateAspects: PropTypes.func,
};
