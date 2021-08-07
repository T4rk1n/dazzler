import React from 'react';
import {DazzlerProps} from '../../../commons/js/types';

type DataListProps = {
    /**
     * Options of the datalist.
     */
    options: {label: string; value: any}[];

    /**
     * Unique id for the component.
     */
    id?: string;

    /**
     * Value of the text input.
     */
    value?: string;

    /**
     * The value of the selected option if found.
     */
    data_value?: any;

    /**
     * Tooltip.
     */
    title?: string;
} & DazzlerProps;

/**
 * A html datalist (select with autocomplete).
 */
export default class DataList extends React.Component<DataListProps> {
    render() {
        const {class_name, id, identity, value, options, title} = this.props;
        const list_id = `datalist-${identity}`;
        return (
            <div className={class_name} id={id || identity} title={title}>
                <input
                    list={list_id}
                    onChange={(e) => {
                        const value = e.target.value;

                        const data_value = options.reduce(
                            (data, option) =>
                                data ||
                                (option.label === value ? option.value : data),
                            null
                        );
                        this.props.updateAspects({value, data_value});
                    }}
                    value={value}
                />
                <datalist id={list_id}>
                    {options.map((option) => (
                        <option value={option.label} />
                    ))}
                </datalist>
            </div>
        );
    }
}
