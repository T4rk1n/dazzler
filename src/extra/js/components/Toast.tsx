import React, {useEffect, useMemo, useState} from 'react';
import PropTypes from 'prop-types';
import {join} from 'ramda';
import {ToastProps} from '../types';

/**
 * Display a message over the ui that will disappears after a delay.
 *
 * :CSS:
 *
 *     - ``dazzler-extra-toast``
 *     - ``opened``
 *     - ``toast-inner``
 *     - ``top``
 *     - ``top-left``
 *     - ``top-right``
 *     - ``bottom``
 *     - ``bottom-left``
 *     - ``bottom-right``
 *     - ``right``
 */
const Toast = (props: ToastProps) => {
    const {
        class_name,
        style,
        identity,
        message,
        position,
        opened,
        delay,
        updateAspects,
    } = props;
    const [displayed, setDisplayed] = useState(false);

    const css = useMemo(() => {
        const c = [class_name, position];
        if (opened) {
            c.push('opened');
        }
        return join(' ', c);
    }, [class_name, opened, position]);
    useEffect(() => {
        if (opened && !displayed) {
            setTimeout(() => {
                updateAspects({opened: false});
                setDisplayed(false);
            }, delay);
            setDisplayed(true);
        }
    }, [opened, displayed, delay]);

    return (
        <div className={css} style={style} id={identity}>
            {message}
        </div>
    );
};

Toast.defaultProps = {
    delay: 3000,
    position: 'top',
    opened: true,
};

export default Toast;
