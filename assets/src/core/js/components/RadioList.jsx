import React from 'react';
import PropTypes from 'prop-types';

/**
 * A radio button list where only a single value can be selected.
 */
export default class RadioList extends React.Component {
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
            labels_class_name,
            labels_style,
            options_class_name,
            options_style,
        } = this.props;

        return (
            <div id={id || identity} className={class_name}>
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

RadioList.defaultProps = {};

RadioList.propTypes = {
    /**
     * Items in the radio list with labels, values and elements attributes.
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
     * Selected radio button.
     */
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

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
