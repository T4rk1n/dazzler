import React, {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {
    concat as concatArray,
    isNil,
    insert as insertArray,
    slice,
    remove,
    join,
    mergeAll,
} from 'ramda';

/**
 * A component where you can ``add`` items to instead of rendering
 * the whole list again. With an optional max size.
 *
 * :CSS:
 *
 *      ``dazzler-core-list-box``
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
}) => {
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
                root.scrollTop = root.scrollHeight;
            } else {
                root.scrollLeft = root.scrollWidth;
            }
            setToScroll(false);
        }
    }, [toScroll]);

    // Render

    const internalStyle = {};
    const css = [class_name, direction];
    if (scrollable) {
        css.push('scrollable');
        if (direction === 'vertical') {
            internalStyle.height = `${size}px`;
        } else {
            internalStyle.width = `${size}px`;
        }
    }
    return (
        <div
            className={join(' ', css)}
            style={mergeAll([style, internalStyle])}
            id={identity}
            ref={root}
        >
            {items}
        </div>
    );
};

ListBox.defaultProps = {
    items: [],
    direction: 'vertical',
};

ListBox.propTypes = {
    /**
     * List of items to render.
     */
    items: PropTypes.arrayOf(PropTypes.node).isRequired,

    /**
     * Maximum amount of items in the list, extra items will be popped off.
     */
    max_length: PropTypes.number,
    /**
     * Add an item to the end of the list.
     */
    append: PropTypes.node,
    /**
     * Add an item to the start of the list.
     */
    prepend: PropTypes.node,
    /**
     * Concatenate another list with the current items.
     */
    concat: PropTypes.arrayOf(PropTypes.node),
    /**
     * Insert an item at an index position.
     */
    insert: PropTypes.shape({
        /**
         * Index to insert the item at.
         */
        index: PropTypes.number,
        /**
         * Item to insert.
         */
        item: PropTypes.node,
    }),

    /**
     * Delete the item at the index.
     */
    delete_index: PropTypes.number,

    /**
     * Wether the list box container is scrollable.
     */
    scrollable: PropTypes.bool,

    /**
     * In which direction the items will be inserted.
     */
    direction: PropTypes.oneOf(['vertical', 'horizontal']),

    /**
     * Must be set for the scrollable aspect to work.
     * Height or width in pixels depending on the direction aspect.
     */
    size: PropTypes.number,

    /**
     * Keep the last appended item in view if scrolling is enabled.
     */
    keep_scroll: PropTypes.bool,

    class_name: PropTypes.string,
    style: PropTypes.object,
    identity: PropTypes.string,
    updateAspects: PropTypes.func,
};

export default ListBox;
