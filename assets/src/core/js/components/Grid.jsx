import React from 'react';
import PropTypes from 'prop-types';

function chunk(arr, n) {
    return arr
        .map((item, index) =>
            index % n === 0 ? arr.slice(index, index + n) : null
        )
        .filter(item => item);
}

/**
 * Render children in a grid.
 */
export default class Grid extends React.Component {
    render() {
        const {identity, class_name, children, columns} = this.props;
        return (
            <div id={identity} className={class_name}>
                {chunk(children, columns).map((row, y) => (
                    <div key={`${identity}-row-${y}`} className={'grid-row'}>
                        {row.map((cell, x) => (
                            <div
                                key={`${identity}-cell-${y}-${x}`}
                                className={'grid-cell'}
                            >
                                {cell}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        );
    }
}

Grid.defaultProps = {};

Grid.propTypes = {
    /**
     * Children to render in a grid.
     */
    children: PropTypes.arrayOf(PropTypes.node).isRequired,
    /**
     * Number of columns
     */
    columns: PropTypes.number.isRequired,

    /**
     *  Unique id for this component
     */
    identity: PropTypes.string,

    /**
     * Update aspects on the backend.
     */
    updateAspects: PropTypes.func,
};
