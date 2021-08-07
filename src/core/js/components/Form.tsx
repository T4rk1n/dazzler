import React from 'react';
import {OnOff} from '../types';
import {DazzlerProps} from '../../../commons/js/types';

type FormProps = {
    /**
     * Fields of the form, either provide a component or a type for the input.
     */
    fields?: {
        label?: string;
        name: string;
        type?: string;
        component?: JSX.Element;
        value?: any;
    }[];

    /**
     * Render on top of the form (CSS: form-header)
     */
    header?: JSX.Element;
    /**
     * Render in the middle of the form, after the fields. (CSS: form-body)
     */
    body?: JSX.Element;
    /**
     * Render at the bottom of the form (CSS: form-footer)
     */
    footer?: JSX.Element;

    /**
     * Url to submit the form.
     */
    action?: string;

    /**
     * Http method to submit the form.
     */
    method?: 'get' | 'post' | 'put' | 'patch';

    /**
     * How will the response display.
     */
    target?: '_blank' | '_self' | '_parent' | '_top';

    /**
     * Name of the form.
     */
    name?: string;

    /**
     * Specifies auto complete for the form.
     */
    auto_complete?: OnOff;

    /**
     * How the data is encode before submit.
     */
    enctype?:
        | 'application/x-www-form-urlencoded'
        | 'multipart/form-data'
        | 'text/plain';

    /**
     * Character encoding for submission.
     */
    accept_charset?: string;

    /**
     * Specify the form should be validated on submission.
     */
    no_validate?: boolean;

    /**
     * Errors to show with the fields. Keys are name.
     */
    errors?: object;

    /**
     * Include a submit button on the form.
     */
    include_submit?: boolean;

    /**
     * Label of the submit button.
     */
    submit_label?: string;
} & DazzlerProps;

/**
 * A form element with auto fields.
 *
 * :CSS:
 *
 *     - ``dazzler-core-form``
 *     - ``form-header``
 *     - ``form-body``
 *     - ``form-field``
 *     - ``field-error``
 *     - ``form-label``
 *     - ``form-input``
 *     - ``form-footer``
 *     - ``form-submit``
 */
export default class Form extends React.Component<FormProps> {
    render() {
        const {
            identity,
            class_name,
            style,
            action,
            method,
            target,
            auto_complete,
            name,
            header,
            fields,
            body,
            footer,
            errors,
            include_submit,
            submit_label,
        } = this.props;
        return (
            <form
                id={identity}
                className={class_name}
                style={style}
                action={action}
                method={method}
                target={target}
                autoComplete={auto_complete}
                name={name}
            >
                {header && <div className="form-header">{header}</div>}
                <div className="form-body">
                    {fields &&
                        fields.map(({label, type, name, component, value}) => {
                            const error = errors[name];
                            return (
                                <div
                                    className={
                                        'form-field' +
                                        (error ? ' field-error' : '')
                                    }
                                    key={`form-${identity}-${name}`}
                                >
                                    <label className="form-label">
                                        {label}
                                    </label>
                                    {component || (
                                        <input
                                            name={name}
                                            type={type}
                                            className={'form-input'}
                                            value={value}
                                        />
                                    )}

                                    {error && (
                                        <div className="form-error">
                                            {error}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    {body}
                </div>
                {footer && <div className="form-footer">{footer}</div>}
                {include_submit && (
                    <button type="submit" className="form-submit">
                        {submit_label}
                    </button>
                )}
            </form>
        );
    }
    static defaultProps = {
        include_submit: true,
        submit_label: 'Submit',
        errors: {},
    };
}
