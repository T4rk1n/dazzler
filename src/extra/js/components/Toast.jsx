import React, {useEffect, useMemo, useState} from 'react';
import PropTypes from 'prop-types';
import {join} from 'ramda';

/**
 * Display a message over the ui that will disappears after a delay.
 */
const Toast = props => {
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

Toast.propTypes = {
    /**
     * What to show in the toast.
     */
    message: PropTypes.node.isRequired,

    /**
     * Delay in milliseconds before the toast is automatically closed.
     */
    delay: PropTypes.number,

    /**
     * Where the toast will be display.
     */
    position: PropTypes.oneOf([
        'top',
        'top-left',
        'top-right',
        'bottom',
        'bottom-left',
        'bottom-right',
        'left',
        'right',
        'center',
    ]),
    /**
     * To display the toast for the delay.
     */
    opened: PropTypes.bool,

    class_name: PropTypes.string,
    style: PropTypes.object,
    identity: PropTypes.string,
    updateAspects: PropTypes.func,
};

export default Toast;
