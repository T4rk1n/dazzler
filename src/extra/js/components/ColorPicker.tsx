import React, {useCallback, useMemo} from 'react';
import {
    HslaColor,
    HslColor,
    HsvaColor,
    HsvColor,
    RgbaColor,
    RgbColor,
    HexColorPicker,
    RgbaColorPicker,
    RgbaStringColorPicker,
    HslColorPicker,
    HslStringColorPicker,
    RgbColorPicker,
    RgbStringColorPicker,
    HslaColorPicker,
    HslaStringColorPicker,
    HsvColorPicker,
    HsvaStringColorPicker,
    HsvaColorPicker,
    HsvStringColorPicker,
} from 'react-colorful';

import {
    AnyDict,
    CommonPresetsProps,
    CommonStyleProps,
    DazzlerProps,
} from '../../../commons/js/types';
import {getCommonStyles, getPresetsClassNames, throttle} from 'commons';
import {AnyColor} from 'react-colorful/dist/types';

type ColorPickerProps = {
    /**
     * Current color value
     */
    value?: AnyColor;
    /**
     * Type of color
     */
    type?: 'hex' | 'rgb' | 'rgba' | 'hsl' | 'hsla' | 'hsv' | 'hsva';
    /**
     * Add a toggle button to activate the color picker.
     */
    toggleable?: boolean;
    /**
     * Content of the toggle button.
     */
    toggle_button?: JSX.Element;
    /**
     * Close the color picker when a value is selected.
     */
    toggle_on_choose?: boolean;
    /**
     * Delay before closing the modal when the
     */
    toggle_on_choose_delay?: number;
    /**
     * Direction to open the color picker on toggle.
     */
    toggle_direction?:
        | 'top'
        | 'top-left'
        | 'top-right'
        | 'left'
        | 'right'
        | 'bottom'
        | 'bottom-left'
        | 'bottom-right';
    /**
     * Show the color picker.
     */
    active?: boolean;
    /**
     * Use a square with background color from the value as the toggle button.
     */
    toggle_button_color?: boolean;
    /**
     * The value will always be a string, usable directly in styles.
     *
     * ``toggle_button_color`` requires a string value or hex type.
     */
    as_string?: boolean;
} & CommonStyleProps &
    CommonPresetsProps &
    DazzlerProps;

/**
 * A color picker powered by react-colorful
 *
 * A toggle button is included or can be disabled with ``toggleable=False``
 * and then it be activated by binding, tie or initial value.
 *
 * Common style aspects goes on the container of the picker, hidden by default.
 *
 * :CSS:
 *
 *      - ``dazzler-extra-color-picker`` - Top level container
 *      - ``dazzler-color-picker-toggle`` - Toggle button
 *      - ``dazzler-color-picker`` - Picker container.
 *
 * .. literalinclude:: ../../tests/components/pages/color_picker.py
 */
const ColorPicker = (props: ColorPickerProps) => {
    const {
        identity,
        class_name,
        style,
        type,
        toggleable,
        toggle_button,
        toggle_on_choose,
        toggle_on_choose_delay,
        toggle_button_color,
        toggle_direction,
        active,
        value,
        updateAspects,
        as_string,
        ...rest
    } = props;
    const css = useMemo(
        () =>
            getPresetsClassNames(
                rest,
                'dazzler-color-picker',
                `toggle-direction-${toggle_direction as string}`
            ),
        [rest, active]
    );

    const className = useMemo(() => {
        const c = [class_name];
        if (active) {
            c.push('active');
        }
        return c.join(' ');
    }, [class_name, active]);

    const styling = useMemo(() => getCommonStyles(rest, style), [rest, style]);

    const autoClose = useCallback(
        throttle<void>(
            () => updateAspects({active: false}),
            toggle_on_choose_delay,
            true
        ),
        []
    );

    const picker = useMemo(() => {
        const onChange = (newColor) => {
            const payload: AnyDict = {value: newColor};
            if (toggle_on_choose) {
                autoClose();
            }
            updateAspects(payload);
        };
        switch (type) {
            case 'rgb':
                if (as_string) {
                    return (
                        <RgbStringColorPicker
                            onChange={onChange}
                            color={value as string}
                        />
                    );
                }
                return (
                    <RgbColorPicker
                        onChange={onChange}
                        color={value as RgbColor}
                    />
                );
            case 'rgba':
                if (as_string) {
                    return (
                        <RgbaStringColorPicker
                            onChange={onChange}
                            color={value as string}
                        />
                    );
                }
                return (
                    <RgbaColorPicker
                        onChange={onChange}
                        color={value as RgbaColor}
                    />
                );
            case 'hsl':
                if (as_string) {
                    return (
                        <HslStringColorPicker
                            onChange={onChange}
                            color={value as string}
                        />
                    );
                }
                return (
                    <HslColorPicker
                        onChange={onChange}
                        color={value as HslColor}
                    />
                );
            case 'hsla':
                if (as_string) {
                    return (
                        <HslaStringColorPicker
                            onChange={onChange}
                            color={value as string}
                        />
                    );
                }
                return (
                    <HslaColorPicker
                        onChange={onChange}
                        color={value as HslaColor}
                    />
                );
            case 'hsv':
                if (as_string) {
                    return (
                        <HsvStringColorPicker
                            onChange={onChange}
                            color={value as string}
                        />
                    );
                }
                return (
                    <HsvColorPicker
                        onChange={onChange}
                        color={value as HsvColor}
                    />
                );
            case 'hsva':
                if (as_string) {
                    return (
                        <HsvaStringColorPicker
                            onChange={onChange}
                            color={value as string}
                        />
                    );
                }
                return (
                    <HsvaColorPicker
                        onChange={onChange}
                        color={value as HsvaColor}
                    />
                );
            case 'hex':
            default:
                return (
                    <HexColorPicker
                        onChange={onChange}
                        color={value as string}
                    />
                );
        }
    }, [
        type,
        value,
        updateAspects,
        toggle_on_choose,
        toggle_on_choose_delay,
        as_string,
    ]);

    const toggleButton = useMemo(() => {
        if (toggle_button_color) {
            return (
                <div
                    className="toggle-button-color"
                    // @ts-ignore
                    style={{backgroundColor: value}}
                />
            );
        }
        // Paint emoji was default but rtd & typescript > 4.5 dont like
        return toggle_button || '🎨';
    }, [toggle_button, toggle_button_color, value]);

    const onToggle = useCallback(() => {
        updateAspects({active: !active});
    }, [active, updateAspects]);

    return (
        <div id={identity} className={className}>
            {toggleable && (
                <div className="dazzler-color-picker-toggle" onClick={onToggle}>
                    {toggleButton}
                </div>
            )}
            <div className={css} style={styling}>
                {picker}
            </div>
        </div>
    );
};

ColorPicker.defaultProps = {
    type: 'hex',
    toggle_button_color: true,
    toggleable: true,
    toggle_on_choose: true,
    toggle_on_choose_delay: 2500,
    toggle_direction: 'top-left',
};

export default ColorPicker;
