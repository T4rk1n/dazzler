import React from 'react';
import {concat} from 'ramda';
import {StylableInputLabelValue} from '../types';
import {DazzlerProps} from '../../../commons/js/types';

type CheckListProps = {
    /**
     * Items in the checklist with labels, values and elements attributes.
     */
    options: StylableInputLabelValue[];

    /**
     * Checked values
     */
    values?: any[];
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

    inputs_class_name?: string;
    /**
     * Global style object of options.
     */
    options_style?: object;
    /**
     * Html id of the component, otherwise the identity is used.
     */
    id?: string;
} & DazzlerProps;

/**
 * A list of labels with options, the values aspect get all selected options.
 */
export default class CheckList extends React.Component<CheckListProps> {
    render() {
        const {
            options,
            identity,
            class_name,
            id,
            labels_class_name,
            inputs_class_name,
            style,
            labels_style,
            options_style,
        } = this.props;

        return (
            <div className={class_name} id={id || identity} style={style}>
                {options.map(
                    ({
                        label,
                        value,
                        title,
                        label_class_name,
                        label_style,
                        input_class_name,
                        input_style,
                    }) => (
                        <label
                            title={title}
                            key={`${identity}-opt-${value}`}
                            className={label_class_name || labels_class_name}
                            style={label_style || labels_style}
                        >
                            {label}
                            <input
                                type="checkbox"
                                className={
                                    input_class_name || inputs_class_name
                                }
                                style={input_style || options_style}
                                onChange={(e) =>
                                    this.props.updateAspects({
                                        values: e.target.checked
                                            ? concat(this.props.values, [value])
                                            : this.props.values.filter(
                                                  (v) => v !== value
                                              ),
                                    })
                                }
                            />
                        </label>
                    )
                )}
            </div>
        );
    }
    static defaultProps = {
        values: [],
    };
}
