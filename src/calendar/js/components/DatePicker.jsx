import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import Calendar from './Calendar';
import {format} from 'date-fns';
import {toTimestamp} from 'commons';

/**
 * Pick a date from a calendar.
 *
 * :CSS:
 *
 *     ``dazzler-calendar-date-picker``
 *     - ``picker``
 */
const DatePicker = props => {
    const {
        class_name,
        identity,
        opened,
        value,
        date_format,
        updateAspects,
    } = props;

    useEffect(() => {
        if (!value) {
            updateAspects({
                value: toTimestamp(new Date()),
            });
        }
    }, [value, updateAspects]);

    if (value === undefined) return null;

    return (
        <div className={class_name} id={identity}>
            <input
                type="text"
                onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    updateAspects({opened: !opened});
                }}
                value={format(new Date(value * 1000), date_format)}
                readOnly={true}
            />
            {opened && (
                <div className="picker">
                    <Calendar
                        month_timestamp={value * 1000}
                        _on_click={({day, month, year}) => {
                            updateAspects({
                                value: toTimestamp(new Date(year, month, day)),
                                opened: false,
                            });
                        }}
                    />
                </div>
            )}
        </div>
    );
};

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

export default DatePicker;
