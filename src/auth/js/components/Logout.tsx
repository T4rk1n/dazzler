import React from 'react';
import {LogoutProps} from '../types';

/**
 * A logout button.
 *
 * :CSS:
 *
 *     - ``dazzler-auth-logout``
 *     - ``logout-button``
 */
const Logout = (props: LogoutProps) => {
    const {
        logout_url,
        label,
        method,
        class_name,
        style,
        identity,
        next_url,
    } = props;

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
};

Logout.defaultProps = {
    method: 'POST',
    label: 'Logout',
};

export default Logout;
