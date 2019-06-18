import React from 'react';
import PropTypes from 'prop-types';

function chunk(arr, n) {
    return arr
        .map((item, index) =>
            index % n === 0 ? arr.slice(index, index + n) : null
        )
        .filter(e => e);
}

export default class Grid extends React.Component {
    render() {
        const {id, class_name} = this.props;
        return (
            <div id={id} className={class_name}>

            </div>
        )
    }
}

Grid.propTypes = {
    id: PropTypes.string,
    class_name: PropTypes.string,

    /**
     *
     */
    columns: PropTypes.number,

    /**
     * Array to chunk into pieces of n columns
     */
    children: PropTypes.arrayOf(PropTypes.node),

    /**
     *  Unique id for this component
     */
    identity: PropTypes.string,

    /**
     * Update aspects on the backend.
     */
    updateAspects: PropTypes.func,
};
