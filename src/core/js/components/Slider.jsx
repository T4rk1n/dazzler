import React from 'react';
import PropTypes from 'prop-types';
import {debounce} from 'commons';

/**
 * A slider with a caret contained within a min and max value.
 *
 * :CSS:
 *
 *     ``dazzler-core-slider``
 *     - ``slider-area``: The outer div of the slider.
 *     - ``slider-handle``: The drag handle
 *     - ``slider-spacer``: The space that is before the handle.
 */
export default class Slider extends React.Component {
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
        let percentage = x / this._root.offsetWidth;
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
        const {
            class_name,
            identity,
            minimum,
            maximum,
            value,
            style,
        } = this.props;
        const {dragging} = this.state;
        const total = maximum - minimum;
        const width = ((value - minimum) / total) * 100;
        return (
            <div className={class_name} id={identity} style={style}>
                <div className="slider-area" ref={r => (this._root = r)}>
                    <div
                        className="slider-spacer"
                        style={{width: `${width}%`}}
                    />
                    <div
                        className={`slider-handle${dragging ? ' dragged' : ''}`}
                        draggable={true}
                        onDragStart={this.onDragStart}
                        onDragEnd={this.onDragEnd}
                        ref={r => (this._draggable = r)}
                    />
                </div>
            </div>
        );
    }
}

Slider.defaultProps = {
    value: 0,
    debounce: 50,
};

Slider.propTypes = {
    /**
     * Minimum (leftmost) value of the slider.
     */
    minimum: PropTypes.number.isRequired,
    /**
     * Maximum (rightmost) value of the slider.
     */
    maximum: PropTypes.number.isRequired,
    /**
     * Current value
     */
    value: PropTypes.number,

    /**
     * Round the value
     */
    round: PropTypes.oneOf(['ceil', 'floor']),

    /**
     * Time in milliseconds to wait before updating the value.
     */
    debounce: PropTypes.number,

    /**
     * CSS classes to use. (Scope: dazzler-core-slider)
     */
    class_name: PropTypes.string,

    /**
     * Style object of the root div.
     */
    style: PropTypes.object,

    /**
     *  Unique id for this component
     */
    identity: PropTypes.string,

    /**
     * Update aspects on the backend.
     */
    updateAspects: PropTypes.func,
};
