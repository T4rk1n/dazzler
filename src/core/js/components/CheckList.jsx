import React from 'react';
import PropTypes from 'prop-types';
import {concat} from 'ramda';

/**
 * A list of labels with options, the values aspect get all selected options.
 */
export default class CheckList extends React.Component {
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
                        input_class_name,
                    }) => (
                        <label
                            title={title}
                            key={`${identity}-opt-${value}`}
                            className={label_class_name || labels_class_name}
                            style={labels_style}
                        >
                            {label}
                            <input
                                type="checkbox"
                                className={
                                    input_class_name || inputs_class_name
                                }
                                style={options_style}
                                onChange={e =>
                                    this.props.updateAspects({
                                        values: e.target.checked
                                            ? concat(this.props.values, [value])
                                            : this.props.values.filter(
                                                  v => v !== value
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
}

CheckList.defaultProps = {
    values: [],
};

CheckList.propTypes = {
    /**
     * Items in the checklist with labels, values and elements attributes.
     */
    options: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string,
            value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            title: PropTypes.string,
            label_class_name: PropTypes.string,
            input_class_name: PropTypes.string,
        })
    ).isRequired,

    /**
     * Checked values
     */
    values: PropTypes.arrayOf(
        PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    ),
    /**
     * Style object of the container.
     */
    style: PropTypes.object,
    /**
     * Class name of the container.
     */
    class_name: PropTypes.string,
    /**
     * Global class name to give to labels.
     */
    labels_class_name: PropTypes.string,
    /**
     * Global labels style objects.
     */
    labels_style: PropTypes.object,
    /**
     * Global options class name.
     */
    options_class_name: PropTypes.string,
    /**
     * Global style object of options.
     */
    options_style: PropTypes.object,
    /**
     * Html id of the component, otherwise the identity is used.
     */
    id: PropTypes.string,

    /**
     *  Unique id for this component
     */
    identity: PropTypes.string,

    /**
     * Update aspects on the backend.
     */
    updateAspects: PropTypes.func,
};
