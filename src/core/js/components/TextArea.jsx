import React from 'react';
import PropTypes from 'prop-types';
import {join} from 'ramda';

/**
 * Html Textarea wrapper.
 */
export default class TextArea extends React.Component {
    resize() {
        this.elem.style.height = 'auto';
        this.elem.style.height = `${this.elem.scrollHeight}px`;
    }

    componentDidMount() {
        if (this.props.autosize) {
            this.resize();
        }
    }

    render() {
        const {
            value,
            identity,
            cols,
            rows,
            name,
            required,
            class_name,
            style,
            autosize,
        } = this.props;

        const css = [class_name];

        if (autosize) {
            css.push('autosize');
        }

        return (
            <textarea
                name={name}
                id={identity}
                cols={cols}
                rows={rows}
                value={value}
                required={required}
                ref={r => (this.elem = r)}
                className={join(' ', css)}
                style={{...style}}
                onChange={e => {
                    this.props.updateAspects({value: e.target.value});
                    if (autosize) {
                        this.resize();
                    }
                }}
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
     * Auto size the
     */
    autosize: PropTypes.bool,

    style: PropTypes.object,
    class_name: PropTypes.string,

    /**
     *  Unique id for this component
     */
    identity: PropTypes.string,

    /**
     * Update aspects on the backend.
     */
    updateAspects: PropTypes.func,
};
