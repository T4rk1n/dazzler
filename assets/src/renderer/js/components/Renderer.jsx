import React from 'react';
import Updater from './Updater';
import PropTypes from 'prop-types';

export default class Renderer extends React.Component {
    componentWillMount() {
        window.dazzler_base_url = this.props.baseUrl;
    }

    render() {
        return (
            <div className="dazzler-renderer">
                <Updater
                    {...this.props}
                />
            </div>
        );
    }
}

Renderer.propTypes = {
    baseUrl: PropTypes.string.isRequired,
    ping: PropTypes.bool,
    ping_interval:  PropTypes.number,
    retries: PropTypes.number,
};
