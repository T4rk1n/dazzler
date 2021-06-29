import React from 'react';
import PropTypes from 'prop-types';
import {join} from 'ramda';

/**
 * Display data in a tabular manner (Non interactive).
 *
 * :CSS:
 *
 *     - ``dazzler-core-table``
 *     - ``table-head``
 *     - ``table-heading``
 *     - ``table-body``
 *     - ``table-row``
 *     - ``table-cell``
 *     - ``table-footer``
 *
 * :Example:
 *
 * .. literalinclude:: ../../tests/components/pages/table.py
 *     :lines: 5-22
 */
export default class Table extends React.Component {
    render() {
        const {
            identity,
            class_name,
            headers,
            rows,
            footer,
            style,
            caption,
            include_row_number,
            row_number_start,
            default_table,
            collapsed,
            centered,
            bordered,
            size,
        } = this.props;
        const c = [class_name];
        if (default_table) {
            c.push('default-table');
        }
        if (collapsed) {
            c.push('collapsed');
        }
        if (centered) {
            c.push('centered');
        }
        if (bordered) {
            c.push('bordered');
        }
        if (size) {
            c.push(size);
        }
        return (
            <table className={join(' ', c)} id={identity} style={style}>
                {caption && (
                    <caption className={'table-title'}>{caption}</caption>
                )}
                {headers && (
                    <thead className="table-head">
                        <tr>
                            {include_row_number && (
                                <th className={'table-heading row-num'} />
                            )}
                            {headers.map(
                                (header, i) => (
                                    <th
                                        key={`${identity}-header-${i}`}
                                        className={'table-heading'}
                                    >
                                        {header}
                                    </th>
                                ),
                                headers
                            )}
                        </tr>
                    </thead>
                )}
                {rows && (
                    <tbody className={'table-body'}>
                        {rows.map((row, i) => (
                            <tr
                                key={`${identity}-row-${i}`}
                                className={'table-row'}
                            >
                                {include_row_number && (
                                    <td className={'table-cell row-num'}>
                                        {row_number_start + i}
                                    </td>
                                )}
                                {row.map((cell, j) => (
                                    <td
                                        key={`${identity}-cell-${j}x${i}`}
                                        className={'table-cell'}
                                    >
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                )}
                {footer && <tfoot className="table-footer">{footer}</tfoot>}
            </table>
        );
    }
}

Table.defaultProps = {
    default_table: true,
    collapsed: true,
};

Table.propTypes = {
    /**
     * Rows of data or components to display.
     */
    rows: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.node)),
    /**
     * Title of the table
     */
    caption: PropTypes.node,
    /**
     * Table headings
     */
    headers: PropTypes.arrayOf(PropTypes.node),
    /**
     * CSS class of the table.
     */
    class_name: PropTypes.string,

    /**
     * Style of the table element.
     */
    style: PropTypes.object,

    /**
     * Content of tfoot element (.table-footer)
     */
    footer: PropTypes.node,

    /**
     * Each row start with the row number.
     */
    include_row_number: PropTypes.bool,

    /**
     * The start of the row number, useful if paged.
     */
    row_number_start: PropTypes.number,

    /**
     * Apply default style.
     */
    default_table: PropTypes.bool,
    /**
     * Collapse the borders of the table.
     */
    collapsed: PropTypes.bool,
    /**
     * Center the cell
     */
    centered: PropTypes.bool,
    /**
     * Put a border around elements
     */
    bordered: PropTypes.bool,

    /**
     * The size of the table.
     */
    size: PropTypes.oneOf([
        'tiny',
        'small',
        'medium',
        'large',
        'larger',
        'x-large',
        'xx-large',
    ]),

    /**
     *  Unique id for this component
     */
    identity: PropTypes.string,

    /**
     * Update aspects on the backend.
     */
    updateAspects: PropTypes.func,
};
