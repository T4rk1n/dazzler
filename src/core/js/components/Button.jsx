import React from 'react';
import PropTypes from 'prop-types';
import {join, concat} from 'ramda';
import {collectTruePropKeys} from 'commons';

/**
 * A button to click on!
 *
 * :CSS: ``dazzler-core-button``
 *
 * @example
 *
 *     from dazzler.system import Page, Trigger
 *     from dazzler.components import core
 *
 *     button = core.Button('Click me', identity='btn')
 *
 *     page = Page(
 *         __name__,
 *         core.Container([button, core.Container(identity="output")])
 *     )
 *
 *     @page.binding(Trigger('btn', 'clicks'))
 *     async def on_click(ctx):
 *         await ctx.set_aspect('output', f'Clicked {ctx.trigger.value}')
 */
export default class Button extends React.Component {
    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return !(this.props.clicks < nextProps.clicks);
    }

    render() {
        const {
            label,
            identity,
            id,
            class_name,
            preset,
            style,
            disabled,
            size,
        } = this.props;

        const css = collectTruePropKeys(this.props, [
            'rounded',
            'circle',
            'bordered',
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
}

Button.defaultProps = {
    clicks: 0,
    bordered: true,
};

Button.propTypes = {
    /**
     * Text or component to display.
     */
    label: PropTypes.node.isRequired,

    /**
     * The number of times the button was clicked.
     */
    clicks: PropTypes.number,

    /**
     * Class name to give the button.
     */
    class_name: PropTypes.string,

    /**
     * Style object to give to the Button.
     */
    style: PropTypes.object,

    /**
     * DOM id, otherwise the identity is used.
     */
    id: PropTypes.string,

    /**
     * Preset style colors to apply.
     */
    preset: PropTypes.oneOf([
        'primary',
        'secondary',
        'danger',
        'warning',
        'success',
    ]),

    /**
     * Disable the button.
     */
    disabled: PropTypes.bool,

    /**
     * Round the edges.
     */
    rounded: PropTypes.bool,

    /**
     * Circle button
     */
    circle: PropTypes.bool,

    /**
     * Add a border
     */
    bordered: PropTypes.bool,

    /**
     * The size of the button.
     */
    size: PropTypes.oneOf([
        'tiny',
        'small',
        'medium',
        'large',
        'larger',
        'x-large',
        'xx-large',
    ]),

    /**
     *  Unique id for this component
     */
    identity: PropTypes.string,

    /**
     * Update aspects on the backend.
     */
    updateAspects: PropTypes.func,
};
