import React from 'react';
import {join, concat} from 'ramda';
import {collectTruePropKeys} from 'commons';
import {DazzlerProps, PresetColor, PresetSize} from '../../../commons/js/types';

type ButtonProps = {
    /**
     * Text or component to display.
     */
    label: JSX.Element;

    /**
     * The number of times the button was clicked.
     */
    clicks?: number;

    /**
     * DOM id, otherwise the identity is used.
     */
    id?: string;

    /**
     * Preset style colors to apply.
     */
    preset?: PresetColor;

    /**
     * Disable the button.
     */
    disabled?: boolean;

    /**
     * Round the edges.
     */
    rounded?: boolean;

    /**
     * Circle button
     */
    circle?: boolean;

    /**
     * Add a border around the button.
     */
    bordered?: boolean;

    /**
     * The size of the button.
     */
    size?: PresetSize;
} & DazzlerProps;

/**
 * A button to click on!
 *
 * :CSS:
 *
 *     - ``dazzler-core-button``
 *     - ``bordered``
 *     - ``rounded``
 *     - ``circle``
 *     - ``primary``
 *     - ``danger``
 *     - ``warning``
 *     - ``success``
 *     - ``tiny``
 *     - ``small``
 *     - ``medium``
 *     - ``large``
 *     - ``x-large``
 *     - ``xx-large``
 *
 * :example:
 *
 * .. literalinclude:: ../../tests/components/pages/button.py
 *     :lines: 5-19
 */
export default class Button extends React.Component<ButtonProps> {
    shouldComponentUpdate(nextProps) {
        return !(this.props.clicks < nextProps.clicks);
    }

    render() {
        const {label, identity, id, class_name, preset, style, disabled, size} =
            this.props;

        const css = collectTruePropKeys(this.props, [
            'rounded',
            'circle',
            'bordered',
            'disabled',
        ]);

        if (preset) {
            css.push(preset);
        } else {
            css.push('default');
        }

        if (size) {
            css.push(size);
        }

        return (
            <button
                className={join(' ', concat(css, [class_name]))}
                id={id || identity}
                style={style}
                disabled={disabled}
                onClick={() =>
                    this.props.updateAspects({clicks: this.props.clicks + 1})
                }
            >
                {label}
            </button>
        );
    }
    static defaultProps = {
        clicks: 0,
        bordered: true,
    };
}
