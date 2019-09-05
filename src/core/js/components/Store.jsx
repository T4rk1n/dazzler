import React from 'react';
import PropTypes from 'prop-types';

/**
 * Store data in the browser memory.
 */
export default class Store extends React.Component {
    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return false;
    }

    render() {
        return null;
    }
}

Store.defaultProps = {};

Store.propTypes = {
    /**
     * Stored data.
     */
    data: PropTypes.any,

    /**
     *  Unique id for this component
     */
    identity: PropTypes.string,

    /**
     * Update aspects on the backend.
     */
    updateAspects: PropTypes.func,
};
