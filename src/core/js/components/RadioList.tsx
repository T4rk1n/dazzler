import React from 'react';
import {CommonStyleProps, DazzlerProps} from '../../../commons/js/types';
import {StylableInputLabelValue} from '../types';
import {getCommonStyles} from 'commons';

type RadioListProps = {
    /**
     * Items in the radio list with labels, values and elements attributes.
     */
    options: StylableInputLabelValue[];

    /**
     * Selected radio button.
     */
    value?: string | number;

    /**
     * Global class name to give to labels.
     */
    labels_class_name?: string;
    /**
     * Global labels style objects.
     */
    labels_style?: object;
    /**
     * Global options class name.
     */
    options_class_name?: string;
    /**
     * Global style object of options.
     */
    options_style?: object;
    /**
     * Html id of the component, otherwise the identity is used.
     */
    id?: string;
} & CommonStyleProps &
    DazzlerProps;

/**
 * A radio button list where only a single value can be selected.
 */
export default class RadioList extends React.Component<RadioListProps> {
    componentDidMount() {
        const {value, options} = this.props;
        if (value === undefined) {
            this.props.updateAspects({value: options[0].value});
        }
    }

    render() {
        const {
            identity,
            id,
            options,
            class_name,
            style,
            labels_class_name,
            labels_style,
            options_class_name,
            options_style,
            ...rest
        } = this.props;

        const styling = getCommonStyles(rest, style);

        return (
            <div id={id || identity} className={class_name} style={styling}>
                {options.map(
                    ({
                        value,
                        label,
                        title,
                        label_class_name,
                        input_class_name,
                    }) => (
                        <label
                            key={`${identity}-opt-${value}`}
                            className={label_class_name || labels_class_name}
                            style={labels_style}
                        >
                            {label}
                            <input
                                name={identity}
                                type="radio"
                                title={title}
                                checked={value === this.props.value}
                                className={
                                    input_class_name || options_class_name
                                }
                                style={options_style}
                                onChange={() => {
                                    this.props.updateAspects({value});
                                }}
                            />
                        </label>
                    )
                )}
            </div>
        );
    }
}
