import React from 'react';
import PropTypes from 'prop-types';
import {concat, isNil, insert, slice, remove, join, mergeAll} from 'ramda';

/**
 * A component where you can ``add`` items to instead of rendering
 * the whole list again. With an optional max size.
 */
export default class ListBox extends React.Component {
    constructor(props) {
        super(props);
        this.scrollToLast = this.scrollToLast.bind(this);
        this.state = {
            toScroll: false,
        };
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        let items = this.props.items;
        const payload = {};
        const {max_length, keep_scroll, scrollable} = this.props;
        if (!isNil(this.props.append)) {
            items = concat(items, [this.props.append]);
            if (max_length && items.length > max_length) {
                items = slice(1, items.length, items);
            }
            payload.append = null;
            if (scrollable && keep_scroll) {
                this.setState({toScroll: true});
            }
        }
        if (!isNil(this.props.prepend)) {
            items = concat([this.props.prepend], items);
            if (max_length && items.length > max_length) {
                items = slice(0, items.length - 1, items);
            }
            payload.prepend = null;
        }
        if (!isNil(this.props.concat)) {
            items = concat(items, this.props.concat);
            if (max_length && items.length > max_length) {
                items = slice(items.length - max_length, items.length, items);
            }
            payload.concat = null;
        }
        if (!isNil(this.props.insert)) {
            items = insert(
                this.props.insert.index,
                this.props.insert.item,
                items
            );
            if (max_length && items.length > max_length) {
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
        if (this.state.toScroll && !prevState.toScroll) {
            this.setState({toScroll: false}, () => {
                // Somehow this needs delay
                setTimeout(this.scrollToLast, 0);
            });
        }
    }

    scrollToLast() {
        const {direction} = this.props;
        if (direction === 'vertical') {
            this.root.scrollTop = this.root.scrollHeight;
        } else {
            this.root.scrollLeft = this.root.scrollWidth;
        }
    }

    render() {
        const {
            class_name,
            style,
            identity,
            items,
            scrollable,
            size,
            direction,
        } = this.props;
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
                ref={r => (this.root = r)}
            >
                {items}
            </div>
        );
    }
}

ListBox.defaultProps = {
    items: [],
    direction: 'vertical',
};

ListBox.propTypes = {
    /**
     * List of items to render.
     */
    items: PropTypes.arrayOf(PropTypes.node),

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
