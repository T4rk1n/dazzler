import React from 'react';
import {join} from 'ramda';
import {DazzlerProps} from '../../../commons/js/types';

type ProgressBarProps = {
    /**
     * The current numeric value. This must be between the minimum and maximum values (min attribute and max attribute) if they are specified. If unspecified or malformed, the value is 0. If specified, but not within the range given by the min attribute and max attribute, the value is equal to the nearest end of the range.
     */
    value?: number;
    /**
     * The lower numeric bound of the measured range. This must be less than the maximum value (max attribute), if specified. If unspecified, the minimum value is 0
     */
    minimum?: number;
    /**
     * The upper numeric bound of the measured range. This must be greater than the minimum value (min attribute), if specified. If unspecified, the maximum value is 1.
     */
    maximum?: number;
    /**
     * The upper numeric bound of the low end of the measured range. This must be greater than the minimum value (min attribute), and it also must be less than the high value and maximum value (high attribute and max attribute, respectively), if any are specified. If unspecified, or if less than the minimum value, the low value is equal to the minimum value.
     */
    low?: number;

    /**
     * The lower numeric bound of the high end of the measured range. This must be less than the maximum value (max attribute), and it also must be greater than the low value and minimum value (low attribute and min attribute, respectively), if any are specified. If unspecified, or if greater than the maximum value, the high value is equal to the maximum value.
     */
    high?: number;
    /**
     * This attribute indicates the optimal numeric value. It must be within the range (as defined by the min attribute and max attribute). When used with the low attribute and high attribute, it gives an indication where along the range is considered preferable. For example, if it is between the min attribute and the low attribute, then the lower range is considered preferred.
     */
    optimum?: number;

    /**
     * CSS class of the inner progress container.
     */
    progress_class_name?: string;

    /**
     * Set to show the value on the progress bar.
     */
    progress_text?: 'percent' | 'value';

    /**
     * Readonly click event with the value.
     */
    click?: {
        value?: number;
        x?: number;
        y?: number;
        timestamp?: number;
    };
    /**
     * Use striped style.
     */
    striped?: boolean;

    /**
     * Use the rounded style
     */
    rounded?: boolean;
} & DazzlerProps;

/**
 * Simple progress bar support by all browsers.
 *
 * :CSS:
 *
 *     - ``dazzler-core-progress-bar``
 *     - ``progress``
 *     - ``high``
 *     - ``low``
 *     - ``optimum``
 *     - ``striped``
 *     - ``rounded``
 */
export default class ProgressBar extends React.Component<ProgressBarProps> {
    progress: HTMLDivElement;
    render() {
        const {
            identity,
            class_name,
            style,
            value,
            minimum,
            maximum,
            optimum,
            high,
            low,
            striped,
            rounded,
            progress_class_name,
            progress_text,
        } = this.props;
        const outerClasses = [class_name];
        const innerClasses = ['progress'];
        if (progress_class_name) {
            innerClasses.push(progress_class_name);
        }
        if (high && value >= high) {
            innerClasses.push('high');
        } else if (optimum && value >= optimum) {
            innerClasses.push('optimum');
        } else if (low && value <= low) {
            innerClasses.push('low');
        }
        if (striped) {
            innerClasses.push('striped');
        }
        if (rounded) {
            innerClasses.push('rounded');
            outerClasses.push('rounded');
        }
        const total = maximum - minimum;
        const width = (value / total) * 100;
        let text = '';
        if (progress_text === 'percent') {
            text = `${width.toFixed(0)} %`;
        }
        if (progress_text === 'value') {
            text = `${value} / ${maximum}`;
        }
        return (
            <div
                id={identity}
                className={join(' ', outerClasses)}
                ref={(r) => (this.progress = r)}
                style={style}
                onClick={(e) => {
                    const x = e.pageX - this.progress.offsetLeft;
                    const y = e.pageY - this.progress.offsetTop;
                    const clicked = (x * maximum) / this.progress.offsetWidth;
                    this.props.updateAspects({
                        click: {
                            x,
                            y,
                            value: clicked,
                            timestamp: e.timeStamp,
                        },
                    });
                }}
            >
                <div
                    className={join(' ', innerClasses)}
                    style={{width: `${width}%`}}
                >
                    {text}
                </div>
            </div>
        );
    }
    static defaultProps = {
        value: 0,
        minimum: 0,
        maximum: 100,
    };
}
