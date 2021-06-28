import React, {useMemo} from 'react';
import PropTypes from 'prop-types';
import {is, join, includes, split, slice, concat, without} from 'ramda';

const TreeViewItem = ({
    label,
    onClick,
    identifier,
    items,
    level,
    selected,
    expanded_items,
    nest_icon_expanded,
    nest_icon_collapsed,
}) => {
    const isSelected = useMemo(
        () => selected && includes(identifier, selected),
        [selected, identifier]
    );
    const isExpanded = useMemo(() => includes(identifier, expanded_items), [
        expanded_items,
        expanded_items,
    ]);
    const css = ['tree-item-label', `level-${level}`];
    if (isSelected) {
        css.push('selected');
    }

    return (
        <div
            className={`tree-item level-${level}`}
            style={{marginLeft: `${level}rem`}}
        >
            <div
                className={join(' ', css)}
                onClick={e => onClick(e, identifier, !!items)}
            >
                {items && (
                    <span className="tree-caret">
                        {isExpanded ? nest_icon_expanded : nest_icon_collapsed}
                    </span>
                )}
                {label || identifier}
            </div>

            {items && isExpanded && (
                <div className="tree-sub-items">
                    {items.map(item =>
                        renderItem({
                            parent: identifier,
                            onClick,
                            item,
                            level: level + 1,
                            selected,
                            nest_icon_expanded,
                            nest_icon_collapsed,
                            expanded_items,
                        })
                    )}
                </div>
            )}
        </div>
    );
};

const renderItem = ({parent, item, level, ...rest}) => {
    if (is(String, item)) {
        return (
            <TreeViewItem
                label={item}
                identifier={parent ? join('.', [parent, item]) : item}
                level={level || 0}
                key={item}
                {...rest}
            />
        );
    }
    return (
        <TreeViewItem
            {...item}
            level={level || 0}
            key={item.identifier}
            identifier={
                parent ? join('.', [parent, item.identifier]) : item.identifier
            }
            {...rest}
        />
    );
};

const TvItemProps = {
    identifier: PropTypes.string.isRequired,
    label: PropTypes.string,
    items: PropTypes.arrayOf(() => PropTypes.shape(TvItemProps)),
};

TreeViewItem.propTypes = TvItemProps;

/**
 * A tree of nested items.
 *
 * :CSS:
 *
 *     - ``dazzler-extra-tree-view``
 *     - ``tree-item``
 *     - ``tree-item-label``
 *     - ``tree-sub-items``
 *     - ``tree-caret``
 *     - ``selected``
 *     - ``level-{n}``
 *
 * :example:
 *
 * .. literalinclude:: ../../tests/components/pages/treeview.py
 */
const TreeView = ({
    class_name,
    style,
    identity,
    updateAspects,
    items,
    selected,
    expanded_items,
    nest_icon_expanded,
    nest_icon_collapsed,
}) => {
    const onClick = (e, identifier, expand) => {
        e.stopPropagation();
        const payload = {};
        if (selected && includes(identifier, selected)) {
            let last = split('.', identifier);
            last = slice(0, last.length - 1, last);
            if (last.length === 0) {
                payload.selected = null;
            } else if (last.length === 1) {
                payload.selected = last[0];
            } else {
                payload.selected = join('.', last);
            }
        } else {
            payload.selected = identifier;
        }

        if (expand) {
            if (includes(identifier, expanded_items)) {
                payload.expanded_items = without([identifier], expanded_items);
            } else {
                payload.expanded_items = concat(expanded_items, [identifier]);
            }
        }
        updateAspects(payload);
    };
    return (
        <div className={class_name} style={style} id={identity}>
            {items.map(item =>
                renderItem({
                    item,
                    onClick,
                    selected,
                    nest_icon_expanded,
                    nest_icon_collapsed,
                    expanded_items,
                })
            )}
        </div>
    );
};

TreeView.defaultProps = {
    nest_icon_collapsed: '⏵',
    nest_icon_expanded: '⏷',
    expanded_items: [],
};

TreeView.propTypes = {
    /**
     * An array of items to render recursively.
     */
    items: PropTypes.arrayOf(
        PropTypes.oneOfType([PropTypes.string, PropTypes.shape(TvItemProps)])
    ).isRequired,
    /**
     * Last clicked path identifier joined by dot.
     */
    selected: PropTypes.string,
    /**
     * Identifiers that have sub items and are open.
     * READONLY.
     */
    expanded_items: PropTypes.array,
    /**
     * Icon to show when sub items are hidden.
     */
    nest_icon_collapsed: PropTypes.string,
    /**
     * Icon to show when sub items are shown.
     */
    nest_icon_expanded: PropTypes.string,

    class_name: PropTypes.string,
    style: PropTypes.object,
    identity: PropTypes.string,
    updateAspects: PropTypes.func,
};

export default TreeView;
