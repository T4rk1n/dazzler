import React from 'react';
import {chunk} from 'commons';
import {DazzlerProps} from '../../../commons/js/types';

type GridProps = {
    /**
     * Children to render in a grid.
     */
    children: JSX.Element[];
    /**
     * Number of columns
     */
    columns: number;
} & DazzlerProps;

/**
 * Render a list in a grid with a number of ``columns``.
 *
 * :CSS:
 *
 *     - ``dazzler-core-grid``
 *     - ``grid-row``
 *     - ``grid-cell``
 *
 * @example
 *
 *     from dazzler.components import core
 *
 *     grid = core.Grid([1, 2, 3, 4], 2)
 */
export default class Grid extends React.Component<GridProps> {
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
