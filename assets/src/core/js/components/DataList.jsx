import React from 'react';
import PropTypes from 'prop-types';

export default class DataList extends React.Component {
    render() {
        const {class_name, id, identity, value, options} = this.props;
        const list_id = `datalist-${identity}`;
        return (
            <div className={class_name} id={id}>
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
    options: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.any,
            label: PropTypes.string,
        })
    ).isRequired,

    id: PropTypes.string,
    class_name: PropTypes.string,

    value: PropTypes.string,

    /**
     * The value of the selected option if found.
     */
    data_value: PropTypes.any,

    /**
     *  Unique id for this component
     */
    identity: PropTypes.string,

    /**
     * Update aspects on the backend.
     */
    updateAspects: PropTypes.func,
};
