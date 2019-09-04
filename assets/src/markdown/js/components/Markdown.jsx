import React from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import {snakeToCamelCase, transformKeys} from '../../../commons/js';
import {omit} from 'ramda';
import CodeBlock from './CodeBlock';

/**
 * A react-markdown wrapper for dazzler.
 */
export default class Markdown extends React.Component {
    render() {
        const {identity, class_name} = this.props;
        return (
            <div id={identity} className={class_name}>
                <ReactMarkdown
                    {...transformKeys(
                        omit(
                            [
                                'identity',
                                'updateAspects',
                                'class_name',
                            ],
                            this.props
                        ),
                        snakeToCamelCase
                    )}
                    renderers={{
                        code: props => (
                            <CodeBlock {...props}/>
                        ),
                    }}
                />
            </div>
        );
    }
}

Markdown.defaultProps = {
    escape_html: true,
};

Markdown.propTypes = {
    /**
     * Markdown string to render.
     */
    source: PropTypes.string.isRequired,

    /**
     * CSS class of the container element.
     */
    class_name: PropTypes.string,

    /**
     * Style object to give to container.
     */
    style: PropTypes.object,

    /**
     * Escape html element in the source.
     */
    escape_html: PropTypes.bool,

    /**
     * Skip rendering of html elements.
     */
    skip_html: PropTypes.bool,

    /**
     * Add data-sourcepos attributes to elements.
     */
    source_pos: PropTypes.bool,

    /**
     * Which type of node to allow rendering, default to all.
     */
    allowed_types: PropTypes.array,

    /**
     * Which types of nodes should not be rendered, default to none.
     */
    disallowed_types: PropTypes.array,

    /**
     * Setting to true will try to extract/unwrap the children
     * of disallowed nodes. For instance, if disallowing Strong,
     * the default behaviour is to simply skip the text within the
     * strong altogether, while the behaviour some might want is to
     * simply have the text returned without the strong wrapping it.
     */
    unwrap_disallowed: PropTypes.bool,

    /**
     * Set the default target for link tags. (`_blank` to open a new tab)
     */
    link_target: PropTypes.string,

    /**
     *  Unique id for this component
     */
    identity: PropTypes.string,

    /**
     * Update aspects on the backend.
     */
    updateAspects: PropTypes.func,
};
