import React from 'react';
import PropTypes from 'prop-types';

export default class Dropdown extends React.Component {
    render() {
        const {options, multi} = this.props;
        return (
            <div>
                <input type="text" className="dropdown-input" />
                <div className="dropdown-toggle" />
                <div>
                    {options
                        .filter(({value}) =>
                            multi
                                ? this.props.value.includes(value)
                                : value === this.props.value
                        )
                        .map(({label, value}) => {
                            if (React.isValidElement(e.label)) {
                                return <div onClick={e => {}}>e.label</div>;
                            }
                        })}
                </div>
            </div>
        );
    }
}

Dropdown.defaultProps = {};

Dropdown.propTypes = {
    options: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
            label: PropTypes.node,
        })
    ).isRequired,

    /**
     * Text to show when no value is selected.
     */
    placeholder: PropTypes.string,

    /**
     *
     */
    searchable: PropTypes.bool,
    multi: PropTypes.bool,

    /**
     *  Unique id for this component
     */
    identity: PropTypes.string,

    /**
     * Update aspects on the backend.
     */
    updateAspects: PropTypes.func,
};
