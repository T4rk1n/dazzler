import React from 'react';
import PropTypes from 'prop-types';
import {format} from 'date-fns';
import {firstDayOfTheMonth, monthLength, prevMonth, nextMonth} from '../utils';
import {range, concat, join} from 'ramda';
import {chunk} from '../../../commons/js';

function calendar(month, year) {
    const days = monthLength(month, year);
    const [previous] = prevMonth(month);
    const shift = range(
        monthLength(previous) - firstDayOfTheMonth(month, year) + 1,
        monthLength(previous) + 1
    );
    const cal = concat(
        shift.map(() => ({empty: true})),
        range(1, days + 1).map(day => ({day, month, year}))
    );
    const chunked = chunk(cal, 7);
    if (chunked.length < 6) {
        // Pad the calendar to 6 weeks so they all have same size.
        chunked.push(range(0, 7).map(() => ({empty: true})));
    }
    return chunked;
}

/**
 * Display a calendar based on the month of a timestamp.
 *
 * :CSS:
 *
 *     ``dazzler-calendar-calendar``
 *     - ``calendar-header``
 *     - ``month-label``
 *     - ``week-labels``
 *     - ``week-label``
 *     - ``calendar-day``
 *     - ``selected-day``
 *     - ``week-rows``
 *     - ``calendar-week``
 *     - ``empty``
 */
export default class Calendar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            month: null,
            year: null,
        };
    }

    componentWillMount() {
        const {selected, month_timestamp, use_selected} = this.props;
        const payload = {};
        let ts, toUpdate;

        if (month_timestamp === undefined) {
            ts = new Date();
            payload.month_timestamp = ts.getTime();
            toUpdate = true;
        } else {
            ts = new Date(month_timestamp);
        }
        this.setState({
            month: ts.getUTCMonth(),
            year: ts.getUTCFullYear(),
        });

        if (selected === undefined && use_selected) {
            payload.selected = {
                day: ts.getUTCDate(),
                month: ts.getUTCMonth(),
                year: ts.getUTCFullYear(),
            };
            toUpdate = true;
        }

        if (toUpdate && this.props.updateAspects) {
            this.props.updateAspects(payload);
        }
    }

    render() {
        const {
            class_name,
            identity,
            week_labels,
            month_format,
            selected,
            use_selected,
        } = this.props;
        let css = class_name;
        if (!class_name) {
            css = 'dazzler-calendar-calendar';
        }
        const {month, year} = this.state;
        const date = new Date(year, month);
        return (
            <div className={css} id={identity}>
                <div className="calendar-header">
                    <span
                        onClick={() => {
                            const [pm, py] = prevMonth(month, year);
                            if (this.props.updateAspects) {
                                this.props.updateAspects({
                                    month_timestamp: new Date(py, pm).getTime(),
                                });
                            }
                            this.setState({
                                month: pm,
                                year: py,
                            });
                        }}
                    >
                        &#9666;
                    </span>
                    <div className="month-label">
                        {format(date, month_format)}
                    </div>
                    <span
                        onClick={() => {
                            const [pm, py] = nextMonth(month, year);
                            if (this.props.updateAspects) {
                                this.props.updateAspects({
                                    month_timestamp: new Date(py, pm).getTime(),
                                });
                            }
                            this.setState({
                                month: pm,
                                year: py,
                            });
                        }}
                    >
                        &#9656;
                    </span>
                </div>
                <div className="week-labels">
                    {week_labels.map(week => (
                        <div
                            className="week-label"
                            key={`${identity}-wl-${week}`}
                        >
                            {week}
                        </div>
                    ))}
                </div>
                <div className="week-rows">
                    {calendar(month, year).map((week, i) => (
                        <div
                            className="calendar-week"
                            key={`${identity}-week-${i}`}
                        >
                            {week.map((day, j) =>
                                day.empty ? (
                                    <div
                                        className="empty"
                                        key={`${identity}-day-emtpy-${j}`}
                                    />
                                ) : (
                                    <div
                                        className={join(
                                            ' ',
                                            concat(
                                                ['calendar-day'],
                                                selected &&
                                                    selected.day === day.day &&
                                                    selected.year === year &&
                                                    selected.month === month
                                                    ? ['selected-day']
                                                    : []
                                            )
                                        )}
                                        key={`${identity}-day-${day.day}`}
                                        onClick={e => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            const payload = {
                                                day: day.day,
                                                month,
                                                year,
                                            };
                                            if (this.props._on_click) {
                                                this.props._on_click(payload);
                                            }
                                            if (
                                                use_selected &&
                                                this.props.updateAspects
                                            ) {
                                                // This component also used by DatePickers.
                                                this.props.updateAspects({
                                                    selected: payload,
                                                });
                                            }
                                        }}
                                    >
                                        {day.day}
                                    </div>
                                )
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}

Calendar.defaultProps = {
    month_format: 'MMMM YYYY',
    week_labels: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    use_selected: true,
};

Calendar.propTypes = {
    /**
     * Timestamp of the month to show. If not supplied is today.
     */
    month_timestamp: PropTypes.number,

    /**
     * The currently selected day as an object
     */
    selected: PropTypes.shape({
        day: PropTypes.number,
        month: PropTypes.number,
        year: PropTypes.number,
    }),

    /**
     * Formatting of the month label
     */
    month_format: PropTypes.string,
    /**
     * Labels for the week, starting from sunday.
     */
    week_labels: PropTypes.arrayOf(PropTypes.string),

    /**
     *  Unique id for this component
     */
    identity: PropTypes.string,

    _on_click: PropTypes.func,

    class_name: PropTypes.string,
    style: PropTypes.object,

    /**
     * Whether to set selected aspect on click/start up.
     * This will disable highlight of day in the calendar.
     */
    use_selected: PropTypes.bool,

    /**
     * Update aspects on the backend.
     */
    updateAspects: PropTypes.func,
};
