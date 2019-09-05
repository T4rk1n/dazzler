import React from 'react';
import PropTypes from 'prop-types';

export default class Form extends React.Component {
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
                        fields.map(({label, type, name, component}) => {
                            const error = errors[name];
                            return (
                                <div
                                    className={
                                        'form-field' + error
                                            ? ' field-error'
                                            : ''
                                    }
                                    key={`form-${identity}-${name}`}
                                >
                                    <label className="form-label">
                                        {label}
                                        {component || (
                                            <input
                                                name={name}
                                                type={type}
                                                className={'form-input'}
                                            />
                                        )}
                                    </label>
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
}

Form.defaultProps = {
    include_submit: true,
    submit_label: 'Submit',
    errors: {},
};

Form.propTypes = {
    /**
     * Fields of the form, either provide a component or a type for the input.
     */
    fields: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            type: PropTypes.string,
            component: PropTypes.node,
        })
    ),

    /**
     * Render on top of the form (CSS: form-header)
     */
    header: PropTypes.node,
    /**
     * Render in the middle of the form, after the fields. (CSS: form-body)
     */
    body: PropTypes.node,
    /**
     * Render at the bottom of the form (CSS: form-footer)
     */
    footer: PropTypes.node,

    /**
     * Url to submit the form.
     */
    action: PropTypes.string,

    /**
     * Http method to submit the form.
     */
    method: PropTypes.oneOf(['get', 'post']),

    /**
     * How will the response display.
     */
    target: PropTypes.oneOf(['_blank', '_self', '_parent', '_top']),

    /**
     * Name of the form.
     */
    name: PropTypes.string,

    /**
     * Specifies auto complete for the form.
     */
    auto_complete: PropTypes.oneOf(['on', 'off']),

    /**
     * How the data is encode before submit.
     */
    enctype: PropTypes.oneOf([
        'application/x-www-form-urlencoded',
        'multipart/form-data',
        'text/plain',
    ]),

    /**
     * Character encoding for submission.
     */
    accept_charset: PropTypes.string,

    /**
     * Specify the form should be validated on submission.
     */
    no_validate: PropTypes.bool,

    /**
     * CSS class of the form element.
     */
    class_name: PropTypes.string,

    /**
     * Style object of the form element.
     */
    style: PropTypes.object,

    /**
     *  Unique id for this component
     */
    identity: PropTypes.string,

    /**
     * Errors to show with the fields. Keys are name.
     */
    errors: PropTypes.object,

    /**
     * Include a submit button on the form.
     */
    include_submit: PropTypes.bool,

    /**
     * Label of the submit button.
     */
    submit_label: PropTypes.string,

    /**
     * Update aspects on the backend.
     */
    updateAspects: PropTypes.func,
};
