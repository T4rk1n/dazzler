import React from 'react';
import PropTypes from 'prop-types';


export default class Interval extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            intervalId: null,
        };
        this.loop = this.loop.bind(this);
    }

    componentWillMount() {
        this.startLoop();
    }

    startLoop() {
        const {timeout} = this.props;
        const intervalId = window.setInterval(this.loop, timeout);
        this.setState({intervalId});
    }

    loop() {
        if (this.props.active) {
            this.props.updateAspects({times: this.props.times + 1});
        } else {
            window.clearInterval(this.state.intervalId);
            this.setState({intervalId: null});
        }
    }

    componentWillUnmount() {
        if (this.state.intervalId) {
            window.clearInterval(this.state.intervalId);
            this.setState({intervalId: null});
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.active && !this.props.active) {
            this.startLoop();
        }
    }

    render() {
        return null;
    }
}


Interval.defaultProps = {
    timeout: 1000,
    times: 0,
    active: true,
};

Interval.propTypes = {
    /**
     * The delay between each time.
     */
    timeout: PropTypes.number,
    /**
     * Number of times the interval was fired.
     */
    times: PropTypes.number,

    /**
     * Enable/disable the interval loop.
     */
    active: PropTypes.bool,

    /**
     * Update aspects on the backend.
     */
    updateAspects: PropTypes.func,
};
