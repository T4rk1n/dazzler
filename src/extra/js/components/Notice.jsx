import React from 'react';
import PropTypes from 'prop-types';
import {timestampProp} from '../../../commons/js';
import {merge} from 'ramda';

/**
 * Browser notifications with permissions handling.
 */
export default class Notice extends React.Component {
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
}

Notice.defaultProps = {
    require_interaction: false,
    clicks: 0,
    clicks_timestamp: -1,
    closes: 0,
    closes_timestamp: -1,
};

// Props docs from https://developer.mozilla.org/en-US/docs/Web/API/Notification/Notification
Notice.propTypes = {
    identity: PropTypes.string,

    /**
     * Permission granted by the user (READONLY)
     */
    permission: PropTypes.oneOf([
        'denied',
        'granted',
        'default',
        'unsupported',
    ]),

    title: PropTypes.string.isRequired,

    /**
     * The notification's language, as specified using a DOMString representing a BCP 47 language tag.
     */
    lang: PropTypes.string,
    /**
     * A DOMString representing the body text of the notification, which will be displayed below the title.
     */
    body: PropTypes.string,
    /**
     * A USVString containing the URL of the image used to represent the notification when there is not enough space to display the notification itself.
     */
    badge: PropTypes.string,

    /**
     * A DOMString representing an identifying tag for the notification.
     */
    tag: PropTypes.string,
    /**
     * A USVString containing the URL of an icon to be displayed in the notification.
     */
    icon: PropTypes.string,
    /**
     *  a USVString containing the URL of an image to be displayed in the notification.
     */
    image: PropTypes.string,
    /**
     * A vibration pattern for the device's vibration hardware to emit when the notification fires.
     */
    vibrate: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.arrayOf(PropTypes.number),
    ]),
    /**
     * Indicates that a notification should remain active until the user clicks or dismisses it, rather than closing automatically. The default value is false.
     */
    require_interaction: PropTypes.bool,

    /**
     * Set to true to display the notification.
     */
    displayed: PropTypes.bool,

    clicks: PropTypes.number,
    clicks_timestamp: PropTypes.number,
    /**
     * Number of times the notification was closed.
     */
    closes: PropTypes.number,
    closes_timestamp: PropTypes.number,

    updateAspect: PropTypes.func,
};
