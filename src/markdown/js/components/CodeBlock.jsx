import React from 'react';
import PropTypes from 'prop-types';

import Highlight, {defaultProps} from 'prism-react-renderer';

/**
 * A block of code to highlight.
 *
 * Wrapper of ``prism-react-renderer``.
 *
 * :CSS:
 *
 *      ``dazzler-markdown-code-block``
 */
export default class CodeBlock extends React.Component {
    render() {
        const {
            language,
            value,
            style: outer_style,
            class_name,
            identity,
        } = this.props;
        return (
            <div className={class_name} id={identity} style={outer_style}>
                <Highlight {...defaultProps} code={value} language={language}>
                    {({
                        className,
                        style,
                        tokens,
                        getLineProps,
                        getTokenProps,
                    }) => (
                        <pre
                            className={className}
                            style={{...style, padding: '0.5rem'}}
                        >
                            {tokens.map((line, i) => (
                                <div key={i} {...getLineProps({line, key: i})}>
                                    {line.map((token, key) => (
                                        <span
                                            key={key}
                                            {...getTokenProps({token, key})}
                                        />
                                    ))}
                                </div>
                            ))}
                        </pre>
                    )}
                </Highlight>
            </div>
        );
    }
}

CodeBlock.defaultProps = {};

CodeBlock.propTypes = {
    /**
     * The code to render
     */
    value: PropTypes.node.isRequired,
    /**
     * Language to render
     */
    language: PropTypes.string.isRequired,
    style: PropTypes.object,
    class_name: PropTypes.string,
    /**
     *  Unique id for this component
     */
    identity: PropTypes.string,
};
