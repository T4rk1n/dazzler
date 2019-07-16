import React from 'react';
import PropTypes from 'prop-types';

export default class DataList extends React.Component {
    render() {
        const {class_name, id, identity, value, options, title} = this.props;
        const list_id = `datalist-${identity}`;
        return (
            <div className={class_name} id={id || identity} title={title}>
                <input
                    list={list_id}
                    onChange={e => {
                        const value = e.target.value;
                        const data_value = options.reduce(
                            (data, option) =>
                                option.label === value ? option.value : data,
                            null
                        );
                        this.props.updateAspects({value, data_value});
                    }}
                    value={value}
                />
                <datalist id={list_id}>
                    {options.map(option => (
                        <option value={option.label} />
                    ))}
                </datalist>
            </div>
        );
    }
}

DataList.defaultProps = {};

DataList.propTypes = {
    /**
     * Options of the datalist.
     */
    options: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.any,
            label: PropTypes.string,
        })
    ).isRequired,

    /**
     * Unique id for the component.
     */
    id: PropTypes.string,
    /**
     * CSS class.
     */
    class_name: PropTypes.string,

    /**
     * Value of the text input.
     */
    value: PropTypes.string,


    /**
     * The value of the selected option if found.
     */
    data_value: PropTypes.any,

    /**
     * Tooltip.
     */
    title: PropTypes.string,

    /**
     *  Unique id for this component
     */
    identity: PropTypes.string,

    /**
     * Update aspects on the backend.
     */
    updateAspects: PropTypes.func,
};
