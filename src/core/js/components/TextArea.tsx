import React from 'react';

import {
    CommonPresetsProps,
    CommonStyleProps,
    DazzlerProps,
} from '../../../commons/js/types';
import {getCommonStyles, getPresetsClassNames} from 'commons';

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
} & CommonStyleProps &
    CommonPresetsProps &
    DazzlerProps;

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
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
    }

    resize() {
        this.elem.style.height = 'auto';
        this.elem.style.height = `${this.elem.scrollHeight}px`;
    }

    componentDidMount() {
        if (this.props.autosize) {
            this.resize();
        }
    }

    onChange(e) {
        this.props.updateAspects({value: e.target.value});
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
            ...rest
        } = this.props;

        const css = [class_name];

        if (autosize) {
            css.push('autosize');
        }
        const className = getPresetsClassNames(rest, ...css);
        const styling = getCommonStyles(rest, style);

        return (
            <textarea
                name={name}
                id={identity}
                cols={cols}
                rows={rows}
                value={value}
                required={required}
                ref={(r) => (this.elem = r)}
                className={className}
                style={styling}
                onChange={this.onChange}
            />
        );
    }
}
