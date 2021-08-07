import React from 'react';
import {DazzlerProps} from '../../../commons/js/types';

type IntervalProps = {
    /**
     * The delay between each time.
     */
    timeout?: number;
    /**
     * Number of times the interval was fired.
     */
    times?: number;

    /**
     * Enable/disable the interval loop.
     */
    active?: boolean;
} & DazzlerProps;

type IntervalState = {
    intervalId?: number;
};

/**
 * Update ``times`` aspect every interval to trigger a binding.
 */
export default class Interval extends React.Component<
    IntervalProps,
    IntervalState
> {
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

    static defaultProps = {
        timeout: 1000,
        times: 0,
        active: true,
    };
}
