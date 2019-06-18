import React from 'react';
import PropTypes from 'prop-types';


export default class Interval extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            intervalId: null,
        }
    }

    componentWillMount() {
        const {timeout, updateAspects} = this.props;
        const intervalId = window.setInterval(() => {
            updateAspects({n_interval: this.props.n_interval + 1});
        }, timeout);

        this.setState(intervalId);
    }

    componentWillUnmount() {
        window.clearInterval(this.state.intervalId);
    }

    render() {
        return null;
    }
}


Interval.defaultProps = {
    timeout: 1000,
    n_interval: 0,
};

Interval.propTypes = {
    timeout: PropTypes.number,
    n_interval: PropTypes.number,

    /**
     *  Unique id for this component
     */
    identity: PropTypes.string,

    /**
     * Update aspects on the backend.
     */
    updateAspects: PropTypes.func,
};
