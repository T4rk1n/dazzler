import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
    CommonPresetsProps,
    CommonStyleProps,
    DazzlerProps,
} from '../../../commons/js/types';
import {getCommonStyles, getPresetsClassNames} from 'commons';

type CheckboxProps = {
    /**
     * Whether the checkbox is toggled or not.
     */
    checked?: boolean;
    /**
     * Indeterminate display `-` meaning partial selection.
     */
    indeterminate?: boolean;
    /**
     * Disable the checkbox
     */
    disabled?: boolean;
    /**
     * Click on the checkbox will also set indeterminate status.
     */
    click_indeterminate?: boolean;
} & DazzlerProps &
    CommonStyleProps &
    CommonPresetsProps;

const Checkbox = (props: CheckboxProps) => {
    const {
        checked,
        indeterminate,
        identity,
        style,
        updateAspects,
        class_name,
        click_indeterminate,
        ...rest
    } = props;
    const [clicks, setClicks] = useState(
        0 + (checked ? 1 : 0) + (indeterminate ? 2 : 0)
    );
    const css = useMemo(
        () => getPresetsClassNames(rest, class_name),
        [rest, class_name]
    );
    const styling = useMemo(() => getCommonStyles(rest, style), [rest, style]);
    const ref = useRef();

    const onChange = useCallback(
        (event) => {
            if (click_indeterminate) {
                const nClicks = clicks + 1;
                setClicks(nClicks);
                const payload: any = {};
                const mod = nClicks % 3;
                switch (mod) {
                    case 0:
                        payload.checked = false;
                        payload.indeterminate = false;
                        break;
                    case 1:
                        payload.checked = true;
                        payload.indeterminate = false;
                        break;
                    case 2:
                        payload.checked = false;
                        payload.indeterminate = true;
                        break;
                    default:
                        break;
                }
                updateAspects(payload);
            } else {
                updateAspects({checked: event.target.checked});
            }
        },
        [checked, clicks]
    );

    useEffect(() => {
        if (indeterminate) {
            // @ts-ignore
            ref.current?.indeterminate = true;
        } else {
            // @ts-ignore
            ref.current?.indeterminate = undefined;
        }
    }, [indeterminate]);

    return (
        <input
            id={identity}
            style={styling}
            className={css}
            onChange={onChange}
            checked={checked}
            type="checkbox"
            ref={ref}
        />
    );
};

Checkbox.defaultProps = {
    checked: false,
};

export default Checkbox;
