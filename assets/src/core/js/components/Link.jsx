import React from 'react';
import PropTypes from 'prop-types';
import {timestampProp} from '../../../commons/js';

export default class Link extends React.Component {
    render() {
        const {id, class_name, href, children, style} = this.props;
        // TODO add page name to request the pages urls use the pages
        return (
            <a
                id={id}
                href={href}
                className={class_name}
                style={style}
                onClick={() =>
                    this.props.updateAspects(
                        timestampProp('n_clicks', this.props.n_clicks + 1)
                    )
                }
            >
                {children}
            </a>
        );
    }
}

Link.defaultProps = {};

Link.propTypes = {
    href: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    id: PropTypes.string,
    class_name: PropTypes.string,
    style: PropTypes.object,

    title: PropTypes.string,

    n_clicks: PropTypes.number,
    n_clicks_timestamp: PropTypes.number,
    /**
     *  Unique id for this component
     */
    identity: PropTypes.string,

    /**
     * Update aspects on the backend.
     */
    updateAspects: PropTypes.func,
};
