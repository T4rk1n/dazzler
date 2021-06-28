import React from 'react';
import PropTypes from 'prop-types';

/**
 * A logout button.
 *
 * :CSS:
 *
 *     - ``dazzler-auth-logout``
 *     - ``logout-button``
 */
export default class Logout extends React.Component {
    render() {
        const {
            logout_url,
            label,
            method,
            class_name,
            style,
            identity,
            next_url,
        } = this.props;
        return (
            <form
                action={logout_url}
                method={method}
                className={class_name}
                style={style}
                id={identity}
            >
                <input
                    type="hidden"
                    name="next_url"
                    value={next_url || window.location.href}
                />
                <button type="submit" className="logout-button">
                    {label}
                </button>
            </form>
        );
    }
}

Logout.defaultProps = {
    method: 'POST',
    label: 'Logout',
};

Logout.propTypes = {
    /**
     * Logout url
     */
    logout_url: PropTypes.string.isRequired,

    /**
     * Redirect to this page after logout.
     */
    next_url: PropTypes.string,

    /**
     * Label of the logout button.
     */
    label: PropTypes.string,

    /**
     * Method to submit the logout form.
     */
    method: PropTypes.string,

    class_name: PropTypes.string,
    style: PropTypes.object,
    identity: PropTypes.string,
    updateAspects: PropTypes.func,
};
