import React from 'react';
import {join} from 'ramda';

import {DazzlerProps} from '../../../commons/js/types';

type TextAreaProps = {
    /**
     * Current value of the textarea
     */
    value?: string;
    /**
     * Name of the element for forms.
     */
    name?: string;
    /**
     * Number of columns.
     */
    cols?: number;
    /**
     * Number of rows.
     */
    rows?: number;

    /**
     * Is it required in a form.
     */
    required?: boolean;

    /**
     * Is it disabled ?
     */
    disabled?: boolean;

    /**
     * Hint when no value is entered.
     */
    placeholder?: string;

    /**
     * Max length of the value.
     */
    max_length?: number;

    /**
     * Auto size the text area to the content value.
     */
    autosize?: boolean;
} & DazzlerProps;

/**
 * Html Textarea wrapper.
 *
 * :CSS:
 *
 *     - ``dazzler-core-text-area``
 *     - ``autosize``
 */
export default class TextArea extends React.Component<TextAreaProps> {
    elem: HTMLTextAreaElement;
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
                ref={(r) => (this.elem = r)}
                className={join(' ', css)}
                style={{...style}}
                onChange={(e) => {
                    this.props.updateAspects({value: e.target.value});
                    if (autosize) {
                        this.resize();
                    }
                }}
            />
        );
    }
}
