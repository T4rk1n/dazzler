import React from 'react';
import PropTypes from 'prop-types';

import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import * as prism_styles from 'react-syntax-highlighter/dist/esm/styles/prism';

/**
 * A block of code to highlight.
 */
export default class CodeBlock extends React.Component {
    render() {
        const {language, value, style, class_name, editable, identity} = this.props;
        return (
            <div className={class_name} contentEditable={editable} id={identity} onInput={(e) => {
                console.log('Change');
                this.props.updateAspects({value: this.getDOMnode().innerHTML})
            }}>
                  <SyntaxHighlighter
                    language={language}
                    style={prism_styles[style]}
                >
                    {value}
                </SyntaxHighlighter>
            </div>

        );
    }
}

CodeBlock.defaultProps = {
    style: 'coy'
};

CodeBlock.propTypes = {
    /**
     * The code to render
     */
    value: PropTypes.node,
    /**
     * Style of highlighted code.
     */
    style: PropTypes.oneOf([
        'coy',
        'dark',
        'funky',
        'okaidia',
        'solarizedlight',
        'tomorrow',
        'twilight',
        'prism',
        'atomDark',
        'base16AteliersulphurpoolLight',
        'cb',
        'darcula',
        'duotoneDark',
        'duotoneSea',
        'duotoneSpace',
        'ghcolors',
        'hopscotch',
        'pojoaque',
        'vs',
        'xonokai',
    ]),

    class_name: PropTypes.string,
    editable: PropTypes.bool,

    /**
     *  Unique id for this component
     */
    identity: PropTypes.string,

    /**
     * Update aspects on the backend.
     */
    updateAspects: PropTypes.func,
};
