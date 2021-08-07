import React from 'react';
import {DazzlerProps} from '../../../commons/js/types';
import {LabelValueAny} from '../types';

type SelectProps = {
    /**
     * Option of the select.
     */
    options: LabelValueAny[];
    /**
     * Controls wether multiple options can be selected.
     */
    multi?: boolean;

    /**
     * Value of the selected option(s)
     */
    value?: number | string | string[];

    /**
     * Size of the options to use instead of
     */
    size?: number;

    /**
     * CSS class of the Select
     */
    class_name?: string;
    /**
     * Placeholder text when the input has no value.
     */
    placeholder?: string;

    /**
     * name of the html input that will be created with the current value
     */
    name?: string;

    /**
     * Disable the component.
     */
    disabled?: boolean;
} & DazzlerProps;

/**
 * A select
 */
export default class Select extends React.Component<SelectProps> {
    render() {
        const {
            options,
            identity,
            multi,
            class_name,
            placeholder,
            name,
            disabled,
        } = this.props;
        return (
            <select
                className={class_name}
                id={identity}
                name={name}
                value={this.props.value}
                multiple={multi}
                disabled={disabled}
                placeholder={placeholder}
                onChange={(e) => {
                    let value;
                    if (multi) {
                        const opts = e.target.options;
                        value = [];
                        for (let i = 0, l = opts.length; i < l; i++) {
                            if (opts[i].selected) {
                                value.push(options[i].value);
                            }
                        }
                    } else {
                        value = options[e.target.selectedIndex].value;
                    }
                    this.props.updateAspects({value});
                }}
            >
                {options.map(({value, label}) => (
                    <option
                        key={`${identity}-option-${value}`}
                        className={'.dazzler-core-option'}
                        value={value}
                    >
                        {label}
                    </option>
                ))}
            </select>
        );
    }
}
