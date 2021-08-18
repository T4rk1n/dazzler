import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {
    CommonPresetsProps,
    CommonStyleProps,
    DazzlerProps,
} from '../../../commons/js/types';
import {getCommonStyles, getPresetsClassNames} from 'commons';

type CheckboxProps = {
    checked?: boolean;
    indeterminate?: boolean;
    disabled?: boolean;
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
        ...rest
    } = props;
    const css = useMemo(
        () => getPresetsClassNames(rest, class_name),
        [rest, class_name]
    );
    const styling = useMemo(() => getCommonStyles(rest, style), [rest, style]);
    const ref = useRef();

    const onChange = useCallback(
        (event) => {
            updateAspects({checked: event.target.checked});
        },
        [checked]
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
