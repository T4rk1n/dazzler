import React, {useMemo} from 'react';
import {chunk, getCommonStyles, getPresetsClassNames} from 'commons';
import {
    CommonPresetsProps,
    CommonStyleProps,
    DazzlerProps,
} from '../../../commons/js/types';

type GridProps = {
    /**
     * Children to render in a grid.
     */
    children: Array<JSX.Element>;
    /**
     * Number of columns
     */
    columns: number;
    /**
     * Set the cell to take up the space between them.
     */
    grow_cell?: boolean;
    /**
     * Each cell are equals in width for a total of 100% per row.
     */
    equal_cell_width?: boolean;
    /**
     * Center the content of the cells.
     */
    center_cells?: boolean;
} & CommonStyleProps &
    CommonPresetsProps &
    DazzlerProps;

/**
 * Render a list in a grid with a number of ``columns``.
 *
 * :CSS:
 *
 *     - ``dazzler-core-grid``
 *     - ``grid-row``
 *     - ``grid-cell``
 *
 * :Example:
 *
 *     from dazzler.components import core
 *
 *     grid = core.Grid([1, 2, 3, 4], 2)
 */
const Grid = (props: GridProps) => {
    const {
        identity,
        class_name,
        style,
        children,
        columns,
        grow_cell,
        equal_cell_width,
        center_cells,
        ...rest
    } = props;
    const width = useMemo(
        () => (equal_cell_width ? `${100 / columns}%` : undefined),
        [equal_cell_width, columns]
    );

    const css = useMemo(() => {
        const init = [class_name];
        if (center_cells) {
            init.push('center-cells');
        }
        return getPresetsClassNames(rest, ...init);
    }, [rest, class_name]);
    const styling = useMemo(() => getCommonStyles(rest, style), [rest, style]);
    return (
        <div id={identity} className={css} style={styling}>
            {chunk(children, columns).map((row, y) => (
                <div key={`${identity}-row-${y}`} className={'grid-row'}>
                    {row.map((cell, x) => (
                        <div
                            key={`${identity}-cell-${y}-${x}`}
                            className={`grid-cell${
                                grow_cell ? ' grow-cell' : ''
                            }`}
                            style={{width}}
                        >
                            {cell}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default Grid;
