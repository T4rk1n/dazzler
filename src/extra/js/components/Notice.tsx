import React from 'react';
import PropTypes from 'prop-types';
import {timestampProp} from 'commons';
import {merge} from 'ramda';
import {NoticeProps} from '../types';

/**
 * Browser notifications with permissions handling.
 */
export default class Notice extends React.Component<NoticeProps> {
    constructor(props) {
        super(props);
        this.state = {
            lastMessage: props.body,
            notification: null,
        };
        this.onPermission = this.onPermission.bind(this);
    }

    componentDidMount() {
        const {updateAspects} = this.props;
        if (!('Notification' in window) && updateAspects) {
            updateAspects({permission: 'unsupported'});
        } else if (Notification.permission === 'default') {
            Notification.requestPermission().then(this.onPermission);
        } else {
            this.onPermission(window.Notification.permission);
        }
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.displayed && this.props.displayed) {
            this.sendNotification(this.props.permission);
        }
    }

    sendNotification(permission) {
        const {
            updateAspects,
            body,
            title,
            icon,
            require_interaction,
            lang,
            badge,
            tag,
            image,
            vibrate,
        } = this.props;
        if (permission === 'granted') {
            const options = {
                requireInteraction: require_interaction,
                body,
                icon,
                lang,
                badge,
                tag,
                image,
                vibrate,
            };
            const notification = new Notification(title, options);
            notification.onclick = () => {
                if (updateAspects) {
                    updateAspects(
                        merge(
                            {displayed: false},
                            timestampProp('clicks', this.props.clicks + 1)
                        )
                    );
                }
            };
            notification.onclose = () => {
                if (updateAspects) {
                    updateAspects(
                        merge(
                            {displayed: false},
                            timestampProp('closes', this.props.closes + 1)
                        )
                    );
                }
            };
        }
    }

    onPermission(permission) {
        const {displayed, updateAspects} = this.props;
        if (updateAspects) {
            updateAspects({permission});
        }
        if (displayed) {
            this.sendNotification(permission);
        }
    }

    render() {
        return null;
    }

    static defaultProps: {
        require_interaction: false,
        clicks: 0,
        clicks_timestamp: -1,
        closes: 0,
        closes_timestamp: -1,
    }
}
