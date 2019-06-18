import React from 'react';
import PropTypes from 'prop-types';


export default class Store extends React.Component {

}


Store.defaultProps = {};

Store.propTypes = {
    /**
     *  Unique id for this component
     */
    identity: PropTypes.string,

    /**
     * Update aspects on the backend.
     */
    updateAspects: PropTypes.func,
};
