import React from 'react';
import PropTypes from 'prop-types';
import {join, concat} from 'ramda';

const Caret = ({side, opened}) => {
    switch (side) {
        case 'top':
            return opened ? <span>&#9650;</span> : <span>&#9660;</span>;
        case 'right':
            return opened ? <span>&#9656;</span> : <span>&#9666;</span>;
        case 'left':
            return opened ? <span>&#9666;</span> : <span>&#9656;</span>;
        case 'bottom':
            return opened ? <span>&#9660;</span> : <span>&#9650;</span>;
    }
};

/**
 * Draw content from the sides of the screen.
 */
export default class Drawer extends React.Component {
    render() {
        const {
            class_name,
            identity,
            style,
            children,
            opened,
            side,
        } = this.props;

        const css = [side];

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
                    onClick={() => this.props.updateAspects({opened: !opened})}
                >
                    <Caret opened={opened} side={side} />
                </div>
            </div>
        );
    }
}

Drawer.defaultProps = {
    side: 'top',
};

Drawer.propTypes = {
    children: PropTypes.node,
    opened: PropTypes.bool,
    style: PropTypes.object,
    class_name: PropTypes.string,
    /**
     * Side which open.
     */
    side: PropTypes.oneOf(['top', 'left', 'right', 'bottom']),

    /**
     *  Unique id for this component
     */
    identity: PropTypes.string,

    /**
     * Update aspects on the backend.
     */
    updateAspects: PropTypes.func,
};
