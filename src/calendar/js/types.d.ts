import {DazzlerProps} from '../../commons/js/types';
import PropTypes from 'prop-types';


type CalendarProps = {
    /**
     * Timestamp of the month to show. If not supplied is today.
     */
    month_timestamp?: number;

    /**
     * The currently selected day as an object
     */
    selected?: {
        day: number,
        month: number,
        year: number,
    };

    /**
     * Formatting of the month label
     */
    month_format?: string;
    /**
     * Labels for the week, starting from sunday.
     */
    week_labels?: string[];

    _on_click?: (date: CalendarDate) => void,

    /**
     * Whether to set selected aspect on click/start up.
     * This will disable highlight of day in the calendar.
     */
    use_selected?: boolean;
} & DazzlerProps;


type DatePickerProps = {
    value?: number;
    opened?: boolean;
    date_format?: string;
} & DazzlerProps;


type TimePickerProps = {
    /**
     * Time value formatted as HH:MM
     */
    value?: string;
    /**
     * Use a custom picker instead of browser dependant.
     * Automatically set when no time input support detected.
     */
    fallback_mode?: boolean;

    /**
     * What to display when in fallback mode.
     */
    mode?: '24h' | 'AM/PM';
} & DazzlerProps;


type TimestampProps = {
    value: number | string;
    format?: string;
    locale?: object;
} & DazzlerProps;


type CalendarDate = {
    day?: number;
    month?: number;
    year?: number;
}
