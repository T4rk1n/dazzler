import React from 'react';
import Updater from './Updater';
import PropTypes from 'prop-types';

export default class Renderer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ready: false,
        };
        // TODO add renderer page config
        this.getHeaders = this.getHeaders.bind(this);
        this.refresh = this.refresh.bind(this);
        this.readyChanged = this.readyChanged.bind(this);
    }

    getHeaders() {
        // TODO add auth system.
    }

    refresh() {
        // TODO refresh auth token.
        return new Promise((resolve, reject) => {});
    }

    readyChanged(ready) {
        this.setState({ready});
    }

    componentWillMount() {
        window.dazzler_base_url = this.props.baseUrl;
    }

    render() {
        return (
            <div className="dazzler-renderer">
                <Updater
                    baseUrl={this.props.baseUrl}
                    getHeaders={this.getHeaders}
                    refresh={this.refresh}
                />
            </div>
        );
    }
}

Renderer.propTypes = {
    baseUrl: PropTypes.string.isRequired,
};
