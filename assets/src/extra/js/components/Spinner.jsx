import React from 'react';
import PropTypes from 'prop-types';

/**
 * Simple html/css spinner.
 */
export default class Spinner extends React.Component {
    render() {
        const {class_name, style, identity} = this.props;
        return (
            <div id={identity} className={class_name} style={style}>
            </div>
        )
    }
}


Spinner.defaultProps = {};

Spinner.propTypes = {
    class_name: PropTypes.string,
    style: PropTypes.object,
    /**
     *  Unique id for this component
     */
    identity: PropTypes.string,

    /**
     * Update aspects on the backend.
     */
    updateAspects: PropTypes.func,
};
