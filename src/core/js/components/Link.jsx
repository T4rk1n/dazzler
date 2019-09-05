import React from 'react';
import PropTypes from 'prop-types';

/**
 * Link to external url or other dazzler page by name.
 */
export default class Link extends React.Component {
    render() {
        const {
            id,
            class_name,
            href,
            children,
            style,
            page_name,
            identity,
        } = this.props;
        let url = href;
        if (page_name) {
            url = `${
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

Link.defaultProps = {};

Link.propTypes = {
    /**
     * The link destination.
     */
    href: PropTypes.string,
    /**
     * Text/Component to show as link.
     */
    children: PropTypes.node,
    /**
     * Id of the html element, othewise the identity is used.
     */
    id: PropTypes.string,
    /**
     * CSS class of the <a> element
     */
    class_name: PropTypes.string,
    /**
     * Style object of root <a> element
     */
    style: PropTypes.object,
    /**
     * Hovered description
     */
    title: PropTypes.string,

    /**
     * Name of the page to redirect to if the href is not set.
     */
    page_name: PropTypes.string,

    /**
     *  Unique id for this component
     */
    identity: PropTypes.string,

    /**
     * Update aspects on the backend.
     */
    updateAspects: PropTypes.func,
};
