import React from 'react';
import {collectTruePropKeys} from 'commons';
import {concat, join} from 'ramda';
import {LoginProps} from '../types';

/**
 * A login form to include on dazzler pages.
 *
 * :CSS:
 *
 *     - ``dazzler-auth-login``
 *     - ``login-field``
 *     - ``login-label``
 *     - ``login-input``
 *     - ``login-username``
 *     - ``login-password``
 *     - ``login-button``
 *
 */
const Login = (props: LoginProps) => {
    const {
        class_name,
        style,
        identity,
        method,
        login_url,
        next_url,
        placeholder_labels,
        username_label,
        password_label,
        submit_label,
        footer,
        header,
    } = props;

    const css = collectTruePropKeys(props, ['horizontal', 'bordered']);

    return (
        <form
            className={join(' ', concat([class_name], css))}
            style={style}
            id={identity}
            method={method}
            action={login_url}
        >
            {header && <div className="login-header">{header}</div>}
            <input
                type="hidden"
                name="next_url"
                value={next_url || window.location.href}
            />
            <div className="login-field">
                {!placeholder_labels && (
                    <label
                        htmlFor={`login-username-${identity}`}
                        className="login-label"
                    >
                        {username_label}
                    </label>
                )}
                <input
                    type="text"
                    name="username"
                    className="login-field login-username"
                    id={`login-username-${identity}`}
                    placeholder={placeholder_labels && username_label}
                />
            </div>
            <div className="login-field">
                {!placeholder_labels && (
                    <label
                        htmlFor={`login-password-${identity}`}
                        className="login-label"
                    >
                        {password_label}
                    </label>
                )}
                <input
                    type="password"
                    name="password"
                    className="login-field login-password"
                    id={`login-password-${identity}`}
                    placeholder={placeholder_labels && password_label}
                />
            </div>
            <button type="submit" className="login-button">
                {submit_label}
            </button>
            {footer && <div className="login-footer">{footer}</div>}
        </form>
    );
};

Login.defaultProps = {
    method: 'POST',
    submit_label: 'Login',
    username_label: 'Username',
    password_label: 'Password',
};

export default Login;
