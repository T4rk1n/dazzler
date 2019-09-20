import React from 'react';
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
export default class TimePicker extends React.Component {
    constructor(props) {
        super(props);
        let minutes = '00',
            hour = '00',
            am_pm = 'AM';
        if (this.props.value) {
            [hour, minutes] = split(':', this.props.value);
            if (this.props.mode === 'AM/PM') {
                [minutes, am_pm] = split(' ', minutes);
            }
        }
        this.state = {
            opened: false,
            hour,
            minutes,
            am_pm,
        };
        this.setHour = this.setHour.bind(this);
        this.setMinute = this.setMinute.bind(this);
        this.updateTime = this.updateTime.bind(this);
    }

    componentWillMount() {
        const dummy = document.createElement('input');
        dummy.type = 'time';
        if (dummy.type === 'text') {
            this.props.updateAspects({fallback_mode: true}, () => {
                if (!this.props.value) {
                    this.updateTime();
                }
            });
        }
    }

    setHour(hour) {
        this.setState({hour, opened: false}, this.updateTime);
    }

    setMinute(minutes) {
        this.setState({minutes, opened: false}, this.updateTime);
    }

    setAMPM(am_pm) {
        this.setState({am_pm, opened: false}, this.updateTime);
    }

    updateTime() {
        const {updateAspects, mode} = this.props;
        const {hour, minutes, am_pm} = this.state;

        updateAspects({
            value:
                mode === '24h'
                    ? `${hour}:${minutes}`
                    : `${hour}:${minutes} ${am_pm}`,
        });
    }

    render() {
        const {fallback_mode, value, class_name, identity, mode} = this.props;
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
                    onClick={() => this.setState({opened: !this.state.opened})}
                />
                {this.state.opened && (
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
                                    onClick={() =>
                                        this.setHour(('0' + h).slice(-2))
                                    }
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
                                    onClick={() =>
                                        this.setMinute(('0' + m).slice(-2))
                                    }
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
                                        onClick={() => this.setAMPM(e)}
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
    }
}

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
