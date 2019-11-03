import React from 'react';
import PropTypes from 'prop-types';
import {omit} from 'ramda';

/**
 * Html input wrapper.
 */
export default class Input extends React.Component {
    render() {
        const {
            id,
            class_name,
            identity,
            type,
            auto_complete,
            auto_focus,
            auto_save,
            auto_correct,
            min_length,
            max_length,
        } = this.props;

        const omitted = [
            'class_name',
            'id',
            'identity',
            'auto_complete',
            'auto_focus',
            'auto_save',
            'auto_correct',
            'min_length',
            'updateAspects',
            'n_blur',
            'n_submit',
            '_name',
            '_package',
        ];
        if (type === 'reset') {
            omitted.push('value');
        }

        return (
            <input
                id={id || identity}
                className={class_name}
                autoComplete={auto_complete}
                autoFocus={auto_focus}
                autoSave={auto_save}
                autoCorrect={auto_correct}
                minLength={min_length}
                maxLength={max_length}
                {...omit(omitted, this.props)}
                onChange={e => {
                    const payload = {};
                    switch (this.props.type) {
                        case 'number':
                            payload.value = Number(e.target.value);
                            break;
                        case 'checkbox':
                            payload.checked = e.target.checked;
                            break;
                        default:
                            payload.value = e.target.value;
                    }
                    this.props.updateAspects(payload);
                }}
                onBlur={() =>
                    this.props.updateAspects({n_blur: this.props.n_blur + 1})
                }
                onKeyUp={e => {
                    if (e.key === 'Enter') {
                        this.props.updateAspects({
                            n_submit: this.props.n_submit + 1,
                        });
                    }
                }}
            />
        );
    }
}

Input.defaultProps = {
    value: '',
    n_blur: 0,
    n_submit: 0,
    checked: false,
};

Input.propTypes = {
    id: PropTypes.string,
    class_name: PropTypes.string,
    style: PropTypes.object,
    name: PropTypes.string,
    required: PropTypes.bool,

    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

    type: PropTypes.oneOf([
        'hidden',
        'text',
        'number',
        'search',
        'tel',
        'password',
        'range',
        'email',
        'url',
        'submit',
        'checkbox',
        'reset',
    ]),

    placeholder: PropTypes.string,

    pattern: PropTypes.string,
    auto_complete: PropTypes.string,
    auto_focus: PropTypes.bool,
    auto_save: PropTypes.string,
    auto_correct: PropTypes.string,

    disabled: PropTypes.bool,

    n_blur: PropTypes.number,
    n_submit: PropTypes.number,

    min: PropTypes.number,
    min_length: PropTypes.number,
    max_length: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    multiple: PropTypes.bool,
    checked: PropTypes.bool,

    /**
     *  Unique id for this component
     */
    identity: PropTypes.string,

    /**
     * Update aspects on the backend.
     */
    updateAspects: PropTypes.func,
};
