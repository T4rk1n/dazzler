import React, {useCallback, useMemo} from 'react';
import {
    CommonStyleProps,
    DazzlerProps,
    PresetColor,
    PresetSize,
} from '../../../commons/js/types';
import {getCommonStyles} from 'commons';
import {join} from 'ramda';

type SwitchProps = {
    /**
     * Switched on or off
     */
    value?: boolean;
    /**
     * Disabled the switch from being toggled.
     */
    disabled?: boolean;
    /**
     * Round the edge of the switch.
     */
    rounded?: boolean;
    /**
     * Color of the switch
     */
    preset_color?: PresetColor;
    preset_size?: PresetSize;
} & CommonStyleProps &
    DazzlerProps;

/**
 * On/Off switch.
 *
 * :CSS:
 *
 *     - ``dazzler-core-switch``
 *     - ``switch-on``
 *     - ``switch-off``
 *     - ``switch-caret``
 *
 * :example:
 *
 * .. literalinclude:: ../../tests/components/pages/switch.py
 */
const Switch = (props: SwitchProps) => {
    const {
        class_name,
        style,
        identity,
        value,
        updateAspects,
        disabled,
        rounded,
        preset_size,
        preset_color,
        ...rest
    } = props;
    const css = useMemo(() => {
        const classNames = [class_name, value ? 'switch-on' : 'switch-off'];
        if (rounded) {
            classNames.push('rounded');
        }
        if (disabled) {
            classNames.push('disabled');
        }
        if (preset_color) {
            classNames.push(`switch-${preset_color}`);
        }
        if (preset_size) {
            classNames.push(preset_size);
        }
        return join(' ', classNames);
    }, [class_name, value, disabled, preset_color, preset_size, rounded]);

    const styling = useMemo(() => getCommonStyles(rest, style), [rest, style]);

    const onClick = useCallback(
        () => updateAspects({value: !value}),
        [updateAspects, value]
    );

    return (
        <div
            className={css}
            style={styling}
            id={identity}
            onClick={disabled ? null : onClick}
        >
            <div className="switch-inner" />
            <div className="switch-caret" />
        </div>
    );
};

Switch.defaultProps = {
    rounded: true,
};

export default Switch;
