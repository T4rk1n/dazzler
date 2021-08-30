import {isNil} from 'ramda';
import {useEffect} from 'react';
import {DazzlerProps} from '../../../commons/js/types';
import {
    WINDOW_RESIZE,
    WINDOW_MOVE,
    WINDOW_FULLSCREEN,
    WINDOW_STATE_INIT,
    WINDOW_SET_BOUNDS,
    WINDOW_SET_FULLSCREEN,
    WINDOW_SET_RESIZABLE,
    WINDOW_SET_MINIMIZABLE,
    WINDOW_SET_MAXIMIZABLE,
    WINDOW_SET_CLOSABLE,
    WINDOW_SET_FOCUS,
    WINDOW_SET_MOVABLE,
    WINDOW_SET_MINIMIZED,
    WINDOW_SET_MAXIMIZED,
} from '../../common/ipcEvents';
import {WindowStatus} from '../../common/types';
import ipc from '../ipc';

type WindowStateProps = WindowStatus & {
    set_width?: number;
    set_height?: number;
    set_fullscreen?: boolean;
    set_x?: number;
    set_y?: number;

    set_focus?: boolean;

    set_resizable?: boolean;

    set_minimizable?: boolean;
    set_maximizable?: boolean;

    closable?: boolean;
    set_closable?: boolean;

    movable?: boolean;
    set_movable?: boolean;

    set_minimized?: boolean;
    /**
     *
     */
    set_maximized?: boolean;

    /**
     * Close the window.
     */
    close?: boolean;
} & DazzlerProps;

/**
 * Get & Set the state of the Electron window.
 *
 * .. warning::
 *      Setting/Getting with ties/binding can lead to circular dependencies.
 */
const WindowState = (props: WindowStateProps) => {
    const {
        updateAspects,
        set_height,
        set_width,
        set_fullscreen,
        set_x,
        set_y,
        set_resizable,
        set_closable,
        set_focus,
        set_movable,
        set_maximizable,
        set_minimizable,
        set_maximized,
        set_minimized,
    } = props;

    useEffect(() => {
        ipc.on(WINDOW_RESIZE, (event, data) => {
            updateAspects({...data});
        });
        ipc.on(WINDOW_MOVE, (event, data) => {
            updateAspects({...data});
        });
        ipc.on(WINDOW_FULLSCREEN, (event, data) => {
            updateAspects({...data});
        });
        ipc.invoke<WindowStatus>(WINDOW_STATE_INIT).then((initial) =>
            updateAspects({...initial})
        );
    }, []);

    const ipcEffect = (
        eventName: string,
        valueKey: string,
        value: any,
        setAspect = false
    ): [() => void, any[]] => [
        () => {
            if (!isNil(value)) {
                const payload = {[valueKey]: value};
                ipc.send(eventName, payload);
                let aspectPayload = {[`set_${valueKey}`]: null};
                if (setAspect) {
                    aspectPayload = {...aspectPayload, ...payload};
                }
                updateAspects(aspectPayload);
            }
        },
        [value, updateAspects],
    ];

    useEffect(...ipcEffect(WINDOW_SET_BOUNDS, 'width', set_width));
    useEffect(...ipcEffect(WINDOW_SET_BOUNDS, 'height', set_height));
    useEffect(
        ...ipcEffect(WINDOW_SET_FULLSCREEN, 'fullscreen', set_fullscreen)
    );
    useEffect(...ipcEffect(WINDOW_SET_BOUNDS, 'x', set_x));
    useEffect(...ipcEffect(WINDOW_SET_BOUNDS, 'y', set_y));
    useEffect(
        ...ipcEffect(WINDOW_SET_RESIZABLE, 'resizable', set_resizable, true)
    );
    useEffect(
        ...ipcEffect(
            WINDOW_SET_MINIMIZABLE,
            'minimizable',
            set_minimizable,
            true
        )
    );
    useEffect(
        ...ipcEffect(
            WINDOW_SET_MAXIMIZABLE,
            'maximizable',
            set_maximizable,
            true
        )
    );
    useEffect(
        ...ipcEffect(WINDOW_SET_CLOSABLE, 'closable', set_closable, true)
    );
    useEffect(...ipcEffect(WINDOW_SET_FOCUS, 'focus', set_focus));
    useEffect(...ipcEffect(WINDOW_SET_MOVABLE, 'movable', set_movable, true));
    useEffect(...ipcEffect(WINDOW_SET_MINIMIZED, 'minimized', set_minimized));
    useEffect(...ipcEffect(WINDOW_SET_MAXIMIZED, 'maximized', set_maximized));

    return null;
};

export default WindowState;
