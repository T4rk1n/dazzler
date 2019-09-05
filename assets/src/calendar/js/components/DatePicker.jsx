import React from 'react';
import PropTypes from 'prop-types';
import Calendar from './Calendar';
import {format} from 'date-fns';
import {toTimestamp} from '../../../commons/js';

/**
 * Pick a date from a calendar.
 */
export default class DatePicker extends React.Component {
    componentWillMount() {
        if (!this.props.value) {
            this.props.updateAspects({
                value: toTimestamp(new Date()),
            });
        }
    }

    render() {
        const {class_name, identity, opened, value, date_format} = this.props;
        if (value === undefined) return null;
        return (
            <div className={class_name} id={identity}>
                <input
                    type="text"
                    onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.props.updateAspects({opened: !opened});
                    }}
                    value={format(new Date(value * 1000), date_format)}
                    readOnly={true}
                />
                {opened && (
                    <div className="picker">
                        <Calendar
                            month_timestamp={value * 1000}
                            _on_click={({day, month, year}) => {
                                this.props.updateAspects({
                                    value: toTimestamp(
                                        new Date(year, month, day)
                                    ),
                                    opened: false,
                                });
                            }}
                        />
                    </div>
                )}
            </div>
        );
    }
}

DatePicker.defaultProps = {
    date_format: 'DD MMM YYYY',
};

DatePicker.propTypes = {
    value: PropTypes.number,
    opened: PropTypes.bool,

    date_format: PropTypes.string,
    /**
     *  Unique id for this component
     */
    identity: PropTypes.string,
    /**
     * Update aspects on the backend.
     */
    updateAspects: PropTypes.func,
};
