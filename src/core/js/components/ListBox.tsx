import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
    concat as concatArray,
    isNil,
    insert as insertArray,
    slice,
    remove,
    mergeRight,
} from 'ramda';
import {
    CommonPresetsProps,
    CommonStyleProps,
    DazzlerProps,
} from '../../../commons/js/types';
import {getCommonStyles, getPresetsClassNames} from 'commons';

type ListBoxProps = {
    /**
     * List of items to render.
     */
    items: JSX.Element[];

    /**
     * Maximum amount of items in the list, extra items will be popped off.
     */
    max_length?: number;
    /**
     * Add an item to the end of the list.
     */
    append?: JSX.Element;
    /**
     * Add an item to the start of the list.
     */
    prepend?: JSX.Element;
    /**
     * Concatenate another list with the current items.
     */
    concat?: JSX.Element[];
    /**
     * Insert an item at an index position.
     */
    insert?: {
        /**
         * Index to insert the item at.
         */
        index: number;
        /**
         * Item to insert.
         */
        item: JSX.Element;
    };

    /**
     * Delete the item at the index.
     */
    delete_index?: number;

    /**
     * Wether the list box container is scrollable.
     */
    scrollable?: boolean;

    /**
     * In which direction the items will be inserted.
     */
    direction?: 'vertical' | 'horizontal';

    /**
     * Must be set for the scrollable aspect to work.
     * Height or width in pixels depending on the direction aspect.
     */
    size?: number;

    /**
     * Keep the last appended item in view if scrolling is enabled.
     */
    keep_scroll?: boolean;
} & CommonStyleProps &
    CommonPresetsProps &
    DazzlerProps;

/**
 * A component where you can ``add`` items to instead of rendering
 * the whole list again. With an optional max size.
 *
 * :CSS:
 *
 *     - ``dazzler-core-list-box``
 *     - ``vertical``
 *     - ``horizontal``
 *     - ``scrollable``
 *
 * :example:
 *
 * .. literalinclude:: ../../tests/components/pages/list_box.py
 */
const ListBox = ({
    items,
    max_length,
    append,
    prepend,
    concat,
    insert,
    delete_index,
    scrollable,
    direction,
    size,
    keep_scroll,
    class_name,
    style,
    identity,
    updateAspects,
    ...rest
}: ListBoxProps) => {
    const root = useRef(null);
    const [toScroll, setToScroll] = useState(false);

    // Operation handlers
    useEffect(() => {
        if (!isNil(append)) {
            let arr = concatArray(items, [append]);
            if (max_length && arr.length > max_length) {
                arr = slice(1, arr.length, arr);
            }
            updateAspects({append: null, items: arr});
            if (scrollable && keep_scroll) {
                setToScroll(true);
            }
        }
    }, [append, max_length, scrollable, keep_scroll]);

    useEffect(() => {
        if (!isNil(prepend)) {
            let arr = concatArray([prepend], items);
            if (max_length && arr.length > max_length) {
                arr = slice(0, arr.length - 1, arr);
            }
            updateAspects({prepend: null, items: arr});
        }
    }, [prepend, max_length, scrollable, keep_scroll]);

    useEffect(() => {
        if (!isNil(concat)) {
            let arr = concatArray(items, concat);
            if (max_length && arr.length > max_length) {
                arr = slice(arr.length - max_length, arr.length, arr);
            }
            updateAspects({concat: null, items: arr});
        }
    }, [concat]);

    useEffect(() => {
        if (!isNil(insert)) {
            let arr = insertArray(insert.index, insert.item, items);
            if (max_length && arr.length > max_length) {
                arr = slice(0, arr.length - 1, arr);
            }
            updateAspects({insert: null, items: arr});
        }
    }, [insert]);

    useEffect(() => {
        if (!isNil(delete_index)) {
            updateAspects({
                delete_index: null,
                items: remove(delete_index, 1, items),
            });
        }
    }, [delete_index]);

    // Update scrolling.

    useEffect(() => {
        if (toScroll) {
            if (direction === 'vertical') {
                root.current.scrollTop = root.current.scrollHeight;
            } else {
                root.current.scrollLeft = root.current.scrollWidth;
            }
            setToScroll(false);
        }
    }, [toScroll]);

    const css = useMemo(
        () =>
            getPresetsClassNames(
                rest,
                class_name,
                direction,
                scrollable ? 'scrollable' : undefined
            ),
        [rest, class_name, direction, scrollable]
    );

    const styling = useMemo(() => {
        const internalStyle: any = {};
        if (scrollable) {
            if (direction === 'vertical') {
                internalStyle.height = `${size}px`;
            } else {
                internalStyle.width = `${size}px`;
            }
        }
        return getCommonStyles(rest, mergeRight(style, internalStyle));
    }, [rest, style, scrollable, direction]);

    return (
        <div className={css} style={styling} id={identity} ref={root}>
            {items}
        </div>
    );
};

ListBox.defaultProps = {
    items: [],
    direction: 'vertical',
};

export default ListBox;
