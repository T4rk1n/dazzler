import React from 'react';
import PropTypes from 'prop-types';

function getMouseX(e, popup) {
    return (
        e.clientX -
        e.target.getBoundingClientRect().left -
        popup.getBoundingClientRect().width / 2
    );
}

/**
 * Wraps a component/text to render a popup when hovering
 * over the children or clicking on it.
 *
 * :CSS:
 *
 *     - ``dazzler-extra-pop-up``
 *     - ``popup-content``
 *     - ``visible``
 */
export default class PopUp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pos: null,
        };
    }
    render() {
        const {
            class_name,
            style,
            identity,
            children,
            content,
            mode,
            updateAspects,
            active,
            content_style,
            children_style,
        } = this.props;

        return (
            <div className={class_name} style={style} id={identity}>
                <div
                    className={'popup-content' + (active ? ' visible' : '')}
                    style={{
                        ...(content_style || {}),
                        left: this.state.pos || 0,
                    }}
                    ref={r => (this.popupRef = r)}
                >
                    {content}
                </div>
                <div
                    className="popup-children"
                    onMouseEnter={e => {
                        if (mode === 'hover') {
                            this.setState(
                                {pos: getMouseX(e, this.popupRef)},
                                () => updateAspects({active: true})
                            );
                        }
                    }}
                    onMouseLeave={() =>
                        mode === 'hover' && updateAspects({active: false})
                    }
                    onClick={e => {
                        if (mode === 'click') {
                            this.setState(
                                {pos: getMouseX(e, this.popupRef)},
                                () => updateAspects({active: !active})
                            );
                        }
                    }}
                    style={children_style}
                >
                    {children}
                </div>
            </div>
        );
    }
}

PopUp.defaultProps = {
    mode: 'hover',
    active: false,
};

PopUp.propTypes = {
    /**
     * Component/text to wrap with a popup on hover/click.
     */
    children: PropTypes.node,
    /**
     * Content of the popup info.
     */
    content: PropTypes.node,
    /**
     * Is the popup currently active.
     */
    active: PropTypes.bool,
    /**
     * Show popup on hover or click.
     */
    mode: PropTypes.oneOf(['hover', 'click']),
    /**
     * CSS for the wrapper.
     */
    class_name: PropTypes.string,
    /**
     * Style of the wrapper.
     */
    style: PropTypes.object,
    /**
     * Style for the popup.
     */
    content_style: PropTypes.object,
    /**
     * Style for the wrapped children.
     */
    children_style: PropTypes.object,

    identity: PropTypes.string,
    updateAspects: PropTypes.func,
};
