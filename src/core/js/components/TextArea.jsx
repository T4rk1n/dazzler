import React from 'react';
import PropTypes from 'prop-types';

/**
 * Html Textarea wrapper.
 */
export default class TextArea extends React.Component {
    render() {
        const {value, identity, cols, rows, name, required} = this.props;
        return (
            <textarea
                name={name}
                id={identity}
                cols={cols}
                rows={rows}
                value={value}
                required={required}
                onChange={e =>
                    this.props.updateAspects({value: e.target.value})
                }
            />
        );
    }
}

TextArea.defaultProps = {};

TextArea.propTypes = {
    /**
     * Current value of the textarea
     */
    value: PropTypes.string,
    /**
     * Name of the element for forms.
     */
    name: PropTypes.string,
    /**
     * Number of columns.
     */
    cols: PropTypes.number,
    /**
     * Number of rows.
     */
    rows: PropTypes.number,

    /**
     * Is it required in a form.
     */
    required: PropTypes.bool,

    /**
     * Is it disabled ?
     */
    disabled: PropTypes.bool,

    /**
     * Hint when no value is entered.
     */
    placeholder: PropTypes.string,

    /**
     * Max length of the value.
     */
    max_length: PropTypes.number,

    /**
     *  Unique id for this component
     */
    identity: PropTypes.string,

    /**
     * Update aspects on the backend.
     */
    updateAspects: PropTypes.func,
};
