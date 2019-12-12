import React from 'react';
import PropTypes from 'prop-types';
import {concat, isNil, insert, slice, remove} from 'ramda';

/**
 * A component where you can ``add`` items to instead of rendering
 * the whole list again. With an optional max size.
 */
export default class ListBox extends React.Component {
    componentDidUpdate(prevProps, prevState, snapshot) {
        let items = this.props.items;
        const payload = {};
        const {max_size} = this.props;
        if (!isNil(this.props.append)) {
            items = concat(items, [this.props.append]);
            if (max_size && items.length > max_size) {
                items = slice(1, items.length, items);
            }
            payload.append = null;
        }
        if (!isNil(this.props.prepend)) {
            items = concat([this.props.prepend], items);
            if (max_size && items.length > max_size) {
                items = slice(0, items.length - 1, items);
            }
            payload.prepend = null;
        }
        if (!isNil(this.props.concat)) {
            items = concat(items, this.props.concat);
            if (max_size && items.length > max_size) {
                items = slice(items.length - max_size, items.length, items);
            }
            payload.concat = null;
        }
        if (!isNil(this.props.insert)) {
            items = insert(
                this.props.insert.index,
                this.props.insert.item,
                items
            );
            if (max_size && items.length > max_size) {
                items = slice(0, items.length - 1, items);
            }
            payload.insert = null;
        }
        if (!isNil(this.props.delete_index)) {
            items = remove(this.props.delete_index, 1, items);
            payload.delete_index = null;
        }
        if (items !== this.props.items) {
            this.props.updateAspects({items, ...payload});
        }
    }

    render() {
        const {class_name, style, identity, items} = this.props;
        return (
            <div className={class_name} style={style} id={identity}>
                {items}
            </div>
        );
    }
}

ListBox.defaultProps = {
    items: [],
};

ListBox.propTypes = {
    /**
     * List of items to render.
     */
    items: PropTypes.arrayOf(PropTypes.node),

    /**
     * Max size of the list, extra items will be popped off.
     */
    max_size: PropTypes.number,
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
        index: PropTypes.number,
        item: PropTypes.node,
    }),

    /**
     * Delete the item at the index.
     */
    delete_index: PropTypes.number,

    class_name: PropTypes.string,
    style: PropTypes.object,
    identity: PropTypes.string,
    updateAspects: PropTypes.func,
};
