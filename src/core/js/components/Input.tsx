import React from 'react';
import {omit} from 'ramda';
import {DazzlerProps} from '../../../commons/js/types';

type InputPayload = {
    value?: number | string;
    checked?: boolean;
};

type InputProps = {
    id?: string;
    name?: string;
    required?: boolean;

    value?: string | number;

    type?:
        | 'hidden'
        | 'text'
        | 'number'
        | 'search'
        | 'tel'
        | 'password'
        | 'range'
        | 'email'
        | 'url'
        | 'submit'
        | 'checkbox'
        | 'reset';

    placeholder?: string;

    pattern?: string;
    auto_complete?: string;
    auto_focus?: boolean;
    auto_save?: string;
    auto_correct?: string;

    disabled?: boolean;

    n_blur?: number;
    n_submit?: number;

    min?: number;
    min_length?: number;
    max_length?: number;
    max?: number;
    step?: string | number;
    multiple?: boolean;
    checked?: boolean;
} & DazzlerProps;

/**
 * Html input wrapper.
 */
export default class Input extends React.Component<InputProps> {
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
                onChange={(e) => {
                    const payload: InputPayload = {};
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
                onKeyUp={(e) => {
                    if (e.key === 'Enter') {
                        this.props.updateAspects({
                            n_submit: this.props.n_submit + 1,
                        });
                    }
                }}
            />
        );
    }
    static defaultProps = {
        value: '',
        n_blur: 0,
        n_submit: 0,
        checked: false,
    };
}
