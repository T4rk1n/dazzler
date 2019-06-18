import React from 'react';
import PropTypes from 'prop-types';

/**
 * Virtual div
 */
export default class Container extends React.Component {
    render() {
        const {
            id,
            class_name,
            style,
            children,
            title,
            identity,
        } = this.props;
        return (
            <div
                id={id || identity}
                className={class_name}
                style={style}
                title={title}
                onClick={() =>
                    this.props.updateAspects({
                        n_clicks: this.props.n_clicks + 1,
                    })
                }
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

    n_clicks: PropTypes.number,

    /**
     *  Unique id for this component
     */
    identity: PropTypes.string,

    /**
     * Update aspects on the backend.
     */
    updateAspects: PropTypes.func,
};
