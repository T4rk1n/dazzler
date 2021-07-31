import React from 'react';
import PropTypes from 'prop-types';
import {toPairs, keys} from 'ramda';

/**
 * Activate a view with key.
 *
 * Standalone or tabbed.
 *
 * :CSS:
 *
 *     - ``dazzler-core-view-port``
 *     - ``view-content``
 *     - ``dazzler-tab``
 *     - ``dazzler-tabs``
 *     - ``tab-active``
 */
export default class ViewPort extends React.Component {
    render() {
        const {
            active,
            views,
            class_name,
            style,
            identity,
            tabbed,
            tab_labels,
            vertical_tabs,
            rounded_tabs,
            bordered,
        } = this.props;
        return (
            <div id={identity} className={class_name} style={style}>
                {tabbed && (
                    <div
                        className={`dazzler-tabs${
                            vertical_tabs ? ' vertical' : ''
                        }${rounded_tabs ? ' rounded' : ''}`}
                    >
                        {keys(views).map((k) => (
                            <div
                                className={`dazzler-tab${
                                    k === active ? ' tab-active' : ''
                                }${rounded_tabs ? ' rounded' : ''}`}
                                key={`${identity}-tab-${k}`}
                                onClick={() =>
                                    this.props.updateAspects({active: k})
                                }
                            >
                                {tab_labels[k] || k}
                            </div>
                        ))}
                        {rounded_tabs && <div className="filler" />}
                    </div>
                )}
                <div
                    className={`view-content${bordered ? ' bordered' : ''}${
                        rounded_tabs ? ' rounded' : ''
                    }`}
                >
                    {toPairs(views).map(([k, v]) => (
                        <div
                            className={
                                k === active
                                    ? 'dazzler-view'
                                    : 'dazzler-view hidden'
                            }
                            key={`${identity}-view-${k}`}
                        >
                            {v}
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}

ViewPort.defaultProps = {};

ViewPort.propTypes = {
    /**
     * The view that is active.
     */
    active: PropTypes.string.isRequired,
    /**
     * A dictionary of components to render with the active key.
     */
    views: PropTypes.objectOf(PropTypes.node).isRequired,

    /**
     * The class name of the outer div.
     */
    class_name: PropTypes.string,
    /**
     * Style object of the outer div.
     */
    style: PropTypes.object,

    /**
     * Incorporate tabs before the views.
     */
    tabbed: PropTypes.bool,

    /**
     * Labels for the tabs otherwise the tab keys will be used.
     */
    tab_labels: PropTypes.objectOf(PropTypes.string),

    /**
     * Make the tabs vertical aligned.
     */
    vertical_tabs: PropTypes.bool,
    /**
     * Round tab style
     */
    rounded_tabs: PropTypes.bool,

    /**
     * Add a border around the viewport content (CSS bordered).
     */
    bordered: PropTypes.bool,

    /**
     *  Unique id for this component
     */
    identity: PropTypes.string,

    /**
     * Update aspects on the backend.
     */
    updateAspects: PropTypes.func,
};
