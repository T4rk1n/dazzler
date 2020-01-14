import React from 'react';
import PropTypes from 'prop-types';
import {chunk} from 'commons';

/**
 * Render a list in a grid with a number of ``columns``.
 *
 * :CSS:
 *
 *     ``dazzler-core-grid``
 *     - ``grid-row``
 *     - ``grid-cell``
 *
 * @example
 *
 *     from dazzler.components import core
 *
 *     grid = core.Grid([1, 2, 3, 4], 2)
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
