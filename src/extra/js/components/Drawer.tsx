import React from 'react';
import {join, concat} from 'ramda';
import {CaretProps, DrawerProps} from '../types';

const Caret = ({side, opened}: CaretProps) => {
    switch (side) {
        case 'top':
            return opened ? <span>&#9650;</span> : <span>&#9660;</span>;
        case 'right':
            return opened ? <span>&#9656;</span> : <span>&#9666;</span>;
        case 'left':
            return opened ? <span>&#9666;</span> : <span>&#9656;</span>;
        case 'bottom':
            return opened ? <span>&#9660;</span> : <span>&#9650;</span>;
        default:
            return null;
    }
};

/**
 * Draw content from the sides of the screen.
 *
 * :CSS:
 *
 *     - ``dazzler-extra-drawer``
 *     - ``drawer-content``
 *     - ``drawer-control``
 *     - ``vertical``
 *     - ``horizontal``
 *     - ``right``
 *     - ``bottom``
 */
const Drawer = (props: DrawerProps) => {
    const {
        class_name,
        identity,
        style,
        children,
        opened,
        side,
        updateAspects,
    } = props;

    const css: string[] = [side];

    if (side === 'top' || side === 'bottom') {
        css.push('horizontal');
    } else {
        css.push('vertical');
    }

    return (
        <div
            className={join(' ', concat(css, [class_name]))}
            id={identity}
            style={style}
        >
            {opened && (
                <div className={join(' ', concat(css, ['drawer-content']))}>
                    {children}
                </div>
            )}
            <div
                className={join(' ', concat(css, ['drawer-control']))}
                onClick={() => updateAspects({opened: !opened})}
            >
                <Caret opened={opened} side={side} />
            </div>
        </div>
    );
};

Drawer.defaultProps = {
    side: 'top',
};

export default Drawer;
