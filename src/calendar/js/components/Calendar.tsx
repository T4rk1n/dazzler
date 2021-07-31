import React, {useEffect, useState} from 'react';
import {format} from 'date-fns';
import {firstDayOfTheMonth, monthLength, prevMonth, nextMonth} from '../utils';
import {range, concat, join} from 'ramda';
import {chunk} from 'commons';
import {CalendarDate, CalendarProps} from '../types';

function calendar(month, year) {
    const days = monthLength(month, year);
    const [previous] = prevMonth(month, year);
    const shift = range(
        monthLength(previous, year) - firstDayOfTheMonth(month, year) + 1,
        monthLength(previous, year) + 1
    );
    const cal = concat(
        shift.map(() => ({empty: true})),
        range(1, days + 1).map((day) => ({day, month, year}))
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
 *     - ``dazzler-calendar-calendar``
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
const Calendar = (props: CalendarProps) => {
    const {
        class_name,
        identity,
        week_labels,
        month_format,
        selected,
        use_selected,
        updateAspects,
        month_timestamp,
    } = props;
    const [{month, year}, setDate] = useState<CalendarDate>({});
    const date = new Date(year, month);

    let css = class_name;

    if (!css) {
        css = 'dazzler-calendar-calendar';
    }

    useEffect(() => {
        const payload: {month_timestamp?: number; selected?: CalendarDate} = {};
        let ts, toUpdate;

        if (month_timestamp === undefined) {
            ts = new Date();
            payload.month_timestamp = ts.getTime();
            toUpdate = true;
        } else {
            ts = new Date(month_timestamp);
        }
        setDate({
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

        if (toUpdate && updateAspects) {
            updateAspects(payload);
        }
    }, [month_timestamp, selected, use_selected]);

    return (
        <div className={css} id={identity}>
            <div className="calendar-header">
                <span
                    onClick={() => {
                        const [pm, py] = prevMonth(month, year);
                        if (updateAspects) {
                            updateAspects({
                                month_timestamp: new Date(py, pm).getTime(),
                            });
                        }
                        setDate({
                            month: pm,
                            year: py,
                        });
                    }}
                >
                    &#9666;
                </span>
                <div className="month-label">{format(date, month_format)}</div>
                <span
                    onClick={() => {
                        const [pm, py] = nextMonth(month, year);
                        if (updateAspects) {
                            updateAspects({
                                month_timestamp: new Date(py, pm).getTime(),
                            });
                        }
                        setDate({
                            month: pm,
                            year: py,
                        });
                    }}
                >
                    &#9656;
                </span>
            </div>
            <div className="week-labels">
                {week_labels.map((week) => (
                    <div className="week-label" key={`${identity}-wl-${week}`}>
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
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        const payload = {
                                            day: day.day,
                                            month,
                                            year,
                                        };
                                        if (props._on_click) {
                                            props._on_click(payload);
                                        }
                                        if (use_selected && updateAspects) {
                                            // This component also used by DatePickers.
                                            updateAspects({
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
};

Calendar.defaultProps = {
    month_format: 'MMMM YYYY',
    week_labels: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    use_selected: true,
};

export default Calendar;
