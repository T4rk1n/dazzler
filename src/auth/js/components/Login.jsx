import React from 'react';
import PropTypes from 'prop-types';
import {collectTruePropKeys} from 'commons';
import {concat, join} from 'ramda';

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
export default class Login extends React.Component {
    render() {
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
        } = this.props;

        const css = collectTruePropKeys(this.props, ['horizontal', 'bordered']);

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
    }
}

Login.defaultProps = {
    method: 'POST',
    submit_label: 'Login',
    username_label: 'Username',
    password_label: 'Password',
};

Login.propTypes = {
    /**
     * The url to perform login.
     */
    login_url: PropTypes.string.isRequired,
    /**
     * Redirect to this page after login.
     */
    next_url: PropTypes.string,
    /**
     * Method to submit the login form.
     */
    method: PropTypes.string,
    /**
     * The label to show before the.
     */
    username_label: PropTypes.string,
    /**
     * Label to replace the password.
     */
    password_label: PropTypes.string,
    /**
     * Label for the submit button.
     */
    submit_label: PropTypes.string,
    /**
     * Style the form with the fields side by side.
     */
    horizontal: PropTypes.bool,
    /**
     * Apply a border around the
     */
    bordered: PropTypes.bool,
    /**
     * Put the label in placeholder attribute instead of a `<label>` element.
     */
    placeholder_labels: PropTypes.bool,

    /**
     * Included as first child of the form.
     * Wrapped under div with CSS class ``login-header``
     */
    header: PropTypes.node,

    /**
     * Included at bottom of the login form.
     * Wrapped under div with CSS class ``login-footer``
     */
    footer: PropTypes.node,

    /**
     * Form errors
     */
    errors: PropTypes.object,

    class_name: PropTypes.string,
    style: PropTypes.object,
    identity: PropTypes.string,
    updateAspects: PropTypes.func,
};
