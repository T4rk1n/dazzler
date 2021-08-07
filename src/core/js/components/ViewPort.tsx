import React from 'react';
import {toPairs, keys} from 'ramda';

import {DazzlerProps, StringDict} from '../../../commons/js/types';

type ViewPortProps = {
    /**
     * The view that is active.
     */
    active: string;
    /**
     * A dictionary of components to render with the active key.
     */
    views: {[k: string]: JSX.Element};

    /**
     * Incorporate tabs before the views.
     */
    tabbed?: boolean;

    /**
     * Labels for the tabs otherwise the tab keys will be used.
     */
    tab_labels?: StringDict;

    /**
     * Make the tabs vertical aligned.
     */
    vertical_tabs?: boolean;
    /**
     * Round tab style
     */
    rounded_tabs?: boolean;

    /**
     * Add a border around the viewport content (CSS bordered).
     */
    bordered?: boolean;
} & DazzlerProps;

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
export default class ViewPort extends React.Component<ViewPortProps> {
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
