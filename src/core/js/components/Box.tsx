import React, {useCallback, useMemo} from 'react';
import {
    CommonPresetsProps,
    CommonStyleProps,
    DazzlerProps,
} from '../../../commons/js/types';
import {getCommonStyles, getPresetsClassNames} from 'commons';
import {mergeRight} from 'ramda';

type BoxProps = {
    /**
     * Elements to display.
     */
    children?: JSX.Element;
    /**
     * Number of times the box was clicked on.
     */
    clicks?: number;

    /**
     * Display the children element in a column.
     * Equals to css: flex-direction: column;
     */
    column?: boolean;
    /**
     * Reverse the element order.
     */
    reverse?: boolean;
    /**
     * Shorthand for justify-content. Alignment for main axis.
     */
    justify?:
        | 'flex-start'
        | 'flex-end'
        | 'center'
        | 'space-between'
        | 'space-around'
        | 'space-evenly';
    /**
     * Flex property to align line items on the cross axis.
     */
    align_items?: 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline';
    /**
     * Alignment across the cross axis.
     */
    align_content?:
        | 'flex-start'
        | 'flex-end'
        | 'center'
        | 'space-between'
        | 'space-around'
        | 'space-evenly'
        | 'stretch';
    /**
     * Flex wrap items onto the next line.
     */
    wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
} & DazzlerProps &
    CommonStyleProps &
    CommonPresetsProps;

/**
 * A box is a flexible container with a default horizontal orientation of
 * elements.
 *
 * :CSS:
 *
 *      - ``dazzler-core-box``
 *
 *  .. code-block:: python
 *
 *      from dazzler.components.core import Box, Text
 *
 *      box = Box([Text('bar'), Text('Foo')], column=True, reverse=True)
 */
const Box = (props: BoxProps) => {
    const {
        children,
        identity,
        class_name,
        style,
        clicks,
        updateAspects,
        column,
        reverse,
        justify,
        align_items,
        align_content,
        wrap,
        ...rest
    } = props;

    const css = useMemo(() => {
        const classNames = [class_name];

        if (column) {
            classNames.push('box-column');
        }
        if (reverse) {
            classNames.push('box-reverse');
        }
        return getPresetsClassNames(rest, ...classNames);
    }, [rest, class_name, column, reverse]);

    const styling = useMemo(() => {
        const styles = {
            justifyContent: justify,
            alignItems: align_items,
            alignContent: align_content,
            flexWrap: wrap,
        };
        return getCommonStyles(rest, mergeRight(styles, style));
    }, [rest, style]);

    const onClick = useCallback(
        () => updateAspects({clicks: clicks + 1}),
        [clicks]
    );

    return (
        <div id={identity} onClick={onClick} className={css} style={styling}>
            {children}
        </div>
    );
};

Box.defaultProps = {};

export default Box;
