import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {range, split} from 'ramda';

/**
 * Time input with fallback for ie and safari.
 *
 * :CSS:
 *
 *     ``dazzler-calendar-time-picker``
 *     - ``time-input``
 *     - ``fallback-timepicker``
 *     - ``time-range``
 *     - ``time-value``
 */
const TimePicker = props => {
    const {
        fallback_mode,
        value,
        class_name,
        identity,
        mode,
        updateAspects,
    } = props;
    const [opened, setOpened] = useState(false);
    const [hour, setHour] = useState(() => {
        if (value) {
            const [h] = split(':', value);
            return h;
        }
        return '00';
    });
    const [minutes, setMinute] = useState(() => {
        if (value) {
            const [_, m] = split(':', value);
            return m;
        }
        return '00';
    });
    const [am_pm, setAMPM] = useState(() => {
        if (value) {
            if (mode === 'AM/PM') {
                [_, am_pm] = split(' ');
                return am_pm;
            }
        }
        return 'AM';
    });

    useEffect(() => {
        updateAspects({
            value:
                mode === '24h'
                    ? `${hour}:${minutes}`
                    : `${hour}:${minutes} ${am_pm}`,
        });
    }, [hour, minutes, am_pm, mode, updateAspects]);

    useEffect(() => {
        const dummy = document.createElement('input');
        dummy.type = 'time';
        if (dummy.type === 'text') {
            updateAspects({fallback_mode: true});
        }
    }, [updateAspects]);

    if (!fallback_mode) {
        return (
            <input
                value={value}
                type="time"
                className={class_name}
                id={identity}
            />
        );
    }
    return (
        <div className={`${class_name} fallback-mode`}>
            <input
                type="text"
                readOnly="readonly"
                className="time-input"
                value={value}
                onClick={() => setOpened({opened: !opened})}
            />
            {opened && (
                <div className="fallback-timepicker">
                    <div className="time-range">
                        <div>HH</div>
                        {range(
                            mode === '24h' ? 0 : 1,
                            mode === '24h' ? 24 : 13
                        ).map(h => (
                            <div
                                className="time-value"
                                key={`${identity}-hour-${h}`}
                                onClick={() => setHour(('0' + h).slice(-2))}
                            >
                                {('0' + h).slice(-2)}
                            </div>
                        ))}
                    </div>
                    <div className="time-range">
                        <div>MM</div>
                        {range(0, 60).map(m => (
                            <div
                                className="time-value"
                                key={`${identity}-min-${m}`}
                                onClick={() => setMinute(('0' + m).slice(-2))}
                            >
                                {('0' + m).slice(-2)}
                            </div>
                        ))}
                    </div>
                    {mode === 'AM/PM' && (
                        <div className="time-range">
                            <div>AM/PM</div>
                            {['AM', 'PM'].map(e => (
                                <div
                                    className="time-value"
                                    key={`${identity}-${e}`}
                                    onClick={() => {
                                        setAMPM(e);
                                    }}
                                >
                                    {e}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

TimePicker.defaultProps = {
    value: '00:00',
    mode: '24h',
};

TimePicker.propTypes = {
    /**
     * Time value formatted as HH:MM
     */
    value: PropTypes.string,

    /**
     * Use a custom picker instead of browser dependant.
     * Automatically set when no time input support detected.
     */
    fallback_mode: PropTypes.bool,

    /**
     * What to display when in fallback mode.
     */
    mode: PropTypes.oneOf(['24h', 'AM/PM']),

    /**
     *  Unique id for this component
     */
    identity: PropTypes.string,

    /**
     * Update aspects on the backend.
     */
    updateAspects: PropTypes.func,
};

export default TimePicker;
