import React from 'react';
import {DazzlerProps} from '../../../commons/js/types';

type LinkProps = {
    /**
     * The link destination.
     */
    href?: string;
    /**
     * Text/Component to show as link.
     */
    children?: JSX.Element;
    /**
     * Id of the html element, otherwise the identity is used.
     */
    id?: string;
    /**
     * Hovered description
     */
    title?: string;

    /**
     * Name of the page to redirect to if the href is not set.
     */
    page_name?: string;
} & DazzlerProps;

/**
 * Link to external url or other dazzler page by name.
 *
 * :CSS: ``dazzler-core-link``
 */
export default class Link extends React.Component<LinkProps> {
    render() {
        const {id, class_name, href, children, style, page_name, identity} =
            this.props;
        let url = href;
        if (page_name) {
            url = `${
                // @ts-ignore
                window.dazzler_base_url
            }/dazzler/link?page=${encodeURIComponent(page_name)}`;
        }
        return (
            <a
                id={id || identity}
                href={url}
                className={class_name}
                style={style}
            >
                {children || page_name || url}
            </a>
        );
    }
}
