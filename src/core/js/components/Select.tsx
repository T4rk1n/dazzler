import React, {useCallback, useMemo} from 'react';
import {
    CommonPresetsProps,
    CommonStyleProps,
    DazzlerProps,
} from '../../../commons/js/types';
import {LabelValueAny} from '../types';
import {getCommonStyles, getPresetsClassNames} from 'commons';

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
} & CommonStyleProps &
    CommonPresetsProps &
    DazzlerProps;

/**
 * A select
 */
const Select = (props: SelectProps) => {
    const {
        options,
        identity,
        multi,
        class_name,
        style,
        placeholder,
        name,
        disabled,
        updateAspects,
        ...rest
    } = props;

    const onChange = useCallback(
        (e) => {
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
            updateAspects({value});
        },
        [options, updateAspects]
    );
    const css = useMemo(
        () => getPresetsClassNames(rest, class_name),
        [rest, class_name]
    );
    const styling = useMemo(() => getCommonStyles(rest, style), [rest, style]);

    return (
        <select
            className={css}
            id={identity}
            name={name}
            style={styling}
            value={props.value}
            multiple={multi}
            disabled={disabled}
            placeholder={placeholder}
            onChange={onChange}
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
};

export default Select;
