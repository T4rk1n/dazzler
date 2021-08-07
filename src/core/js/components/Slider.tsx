import React from 'react';
import {debounce} from 'commons';
import {DazzlerProps} from '../../../commons/js/types';

type SliderProps = {
    /**
     * Minimum (leftmost) value of the slider.
     */
    minimum: number;
    /**
     * Maximum (rightmost) value of the slider.
     */
    maximum: number;
    /**
     * Current value
     */
    value?: number;

    /**
     * Round the value
     */
    round?: 'ceil' | 'floor';

    /**
     * Time in milliseconds to wait before updating the value.
     */
    debounce?: number;
} & DazzlerProps;

type SliderState = {
    dragging: boolean;
};

/**
 * A slider with a caret contained within a min and max value.
 *
 * :CSS:
 *
 *     - ``dazzler-core-slider``
 *     - ``slider-area``: The outer div of the slider.
 *     - ``slider-handle``: The drag handle
 *     - ``slider-spacer``: The space that is before the handle.
 *
 * :Example:
 *
 * .. literalinclude:: ../../tests/components/pages/slider.py
 *     :lines: 5-43
 */
export default class Slider extends React.Component<SliderProps, SliderState> {
    dragX: number;
    _draggable: any;
    _root: HTMLDivElement;

    constructor(props) {
        super(props);
        this.onDragStart = this.onDragStart.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
        this.handleDrag = debounce(this.handleDrag, this.props.debounce);
        this.onDragOver = this.onDragOver.bind(this);
        this.state = {
            dragging: false,
        };
        this.dragX = 0;
    }

    onDragStart(e) {
        this.setState({dragging: true});
        e.nativeEvent.dataTransfer.setData(
            'application/node type',
            this._draggable
        );
        // Put a event listener on document dragover for the time of the
        // drag, hate on you IE and Firefox.
        // Needs to be document otherwise you can only drag over anchor.
        document.addEventListener('dragover', this.onDragOver);
    }

    handleDrag(pageX) {
        // Some basic math, get the position of the x relative to the root.
        // The percentage is the x / width of the root
        // then the value is equal to  minimum + percent * range width
        const {minimum, maximum, round} = this.props;
        const x = pageX - this._root.offsetLeft;
        const percentage = x / this._root.offsetWidth;
        const width = maximum - minimum;

        let value = minimum + percentage * width;

        if (value > maximum) {
            value = maximum;
        }
        if (value < minimum) {
            value = minimum;
        }
        if (round === 'ceil') {
            value = Math.ceil(value);
        } else if (round === 'floor') {
            value = Math.floor(value);
        }
        this.props.updateAspects({value});
    }

    onDragEnd() {
        this.setState({dragging: false});
        document.removeEventListener('dragover', this.onDragOver);
        // Handle the last event, otherwise can't get the max/min values.
        this.handleDrag(this.dragX);
    }

    onDragOver(e) {
        this.handleDrag(e.pageX);
        this.dragX = e.pageX;
    }

    render() {
        const {class_name, identity, minimum, maximum, value, style} =
            this.props;
        const {dragging} = this.state;
        const total = maximum - minimum;
        const width = ((value - minimum) / total) * 100;
        return (
            <div className={class_name} id={identity} style={style}>
                <div className="slider-area" ref={(r) => (this._root = r)}>
                    <div
                        className="slider-spacer"
                        style={{width: `${width}%`}}
                    />
                    <div
                        className={`slider-handle${dragging ? ' dragged' : ''}`}
                        draggable={true}
                        onDragStart={this.onDragStart}
                        onDragEnd={this.onDragEnd}
                        ref={(r) => (this._draggable = r)}
                    />
                </div>
            </div>
        );
    }
    static defaultProps = {
        value: 0,
        debounce: 50,
    };
}
