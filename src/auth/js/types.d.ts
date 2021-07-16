import {DazzlerProps} from '../../commons/js/types';

type LoginProps = {
    /**
     * The url to perform login.
     */
    login_url: string;

    /**
     * Redirect to this page after login.
     */
    next_url?: string;
    /**
     * Method to submit the login form.
     */
    method?: string;
    /**
     * The label to show before the.
     */
    username_label?: string;
    /**
     * Label to replace the password.
     */
    password_label?: string;
    /**
     * Label for the submit button.
     */
    submit_label?: string;
    /**
     * Style the form with the fields side by side.
     */
    horizontal?: boolean;
    /**
     * Apply a border around the
     */
    bordered?: boolean;
    /**
     * Put the label in placeholder attribute instead of a `<label>` element.
     */
    placeholder_labels?: boolean;

    /**
     * Included as first child of the form.
     * Wrapped under div with CSS class ``login-header``
     */
    header?: JSX.Element;

    /**
     * Included at bottom of the login form.
     * Wrapped under div with CSS class ``login-footer``
     */
    footer?: JSX.Element;

    /**
     * Form errors
     */
    errors?: object;
} & DazzlerProps;

type LogoutProps = {
    /**
     * Logout url
     */
    logout_url: string;

    /**
     * Redirect to this page after logout.
     */
    next_url?: string;

    /**
     * Label of the logout button.
     */
    label?: string;

    /**
     * Method to submit the logout form.
     */
    method?: string;
} & DazzlerProps;
