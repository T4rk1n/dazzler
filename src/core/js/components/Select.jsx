import React from 'react';
import PropTypes from 'prop-types';

/**
 * A select
 */
export default class Select extends React.Component {
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

Select.defaultProps = {};

Select.propTypes = {
    /**
     * Option of the select.
     */
    options: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
            label: PropTypes.string,
        })
    ).isRequired,
    /**
     * Controls wether multiple options can be selected.
     */
    multi: PropTypes.bool,

    /**
     * Value of the selected option(s)
     */
    value: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
        PropTypes.arrayOf(
            PropTypes.oneOfType([PropTypes.number, PropTypes.string])
        ),
    ]),

    /**
     * Size of the options to use instead of
     */
    size: PropTypes.number,

    /**
     * CSS class of the Select
     */
    class_name: PropTypes.string,
    /**
     * Placeholder text when the input has no value.
     */
    placeholder: PropTypes.string,

    /**
     * name of the html input that will be created with the current value
     */
    name: PropTypes.string,

    /**
     * Disable the component.
     */
    disabled: PropTypes.bool,

    /**
     *  Unique id for this component
     */
    identity: PropTypes.string,

    /**
     * Update aspects on the backend.
     */
    updateAspects: PropTypes.func,
};
