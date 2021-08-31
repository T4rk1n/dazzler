import {app, BrowserWindow, ipcMain} from 'electron';
import {promises as fs} from 'fs';
import * as path from 'path';
import {debounce} from '../../commons/js/utils';
import {omit, mergeAll, reduce, mergeRight} from 'ramda';
import {
    WINDOW_CLOSE,
    WINDOW_FOCUS,
    WINDOW_FULLSCREEN,
    WINDOW_MAXIMIZE,
    WINDOW_MINIMIZE,
    WINDOW_MOVE,
    WINDOW_RESIZE,
    WINDOW_SET_BOUNDS,
    WINDOW_SET_CLOSABLE,
    WINDOW_SET_FOCUS,
    WINDOW_SET_FULLSCREEN,
    WINDOW_SET_MAXIMIZABLE,
    WINDOW_SET_MAXIMIZED,
    WINDOW_SET_MINIMIZABLE,
    WINDOW_SET_MINIMIZED,
    WINDOW_SET_MOVABLE,
    WINDOW_SET_RESIZABLE,
    WINDOW_STATE_INIT,
} from '../common/ipcEvents';
import {WindowStatus} from '../common/types';

const appData = app.getPath('userData');

type WindowStateSync = WindowStatus & {
    name: string;
    save(): void;
    sync(): void;
};

type WindowStatusGetter = () => WindowStatus;

const combineGetters =
    (...getters: WindowStatusGetter[]) =>
    () =>
        reduce(
            (acc, arg: WindowStatusGetter) => mergeRight(acc, arg()),
            {},
            getters
        );

function getWindowStateFileName(name: string): string {
    return path.join(appData, `${name}.state.json`);
}

async function saveWindowState(state: WindowStateSync) {
    await fs.writeFile(
        getWindowStateFileName(state.name),
        JSON.stringify(state)
    );
}

export async function createWindowState(
    windowName: string,
    window: BrowserWindow,
    saveChanges: boolean
): Promise<WindowStateSync> {
    let state: WindowStateSync;
    if (!(await fs.stat(appData))) {
        await fs.mkdir(appData);
    }

    try {
        const content = await fs.readFile(
            getWindowStateFileName(windowName),
            'utf-8'
        );
        state = JSON.parse(content);
    } catch (e) {
        state = {
            name: windowName,
            width: 800,
            height: 600,
            fullscreen: false,
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            save() {},
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            sync() {},
        };
        await saveWindowState(state);
    }
    state.save = debounce(
        () => {
            saveWindowState(state);
        },
        100,
        true
    );

    state.sync = () => {
        window.setBounds(state);
        window.setFullScreen(state.fullscreen);
    };

    const onChangeFactory =
        (eventName: string, handler: () => WindowStatus) => () => {
            const status = handler();
            state = {...state, ...status};
            if (saveChanges) {
                state.save();
            }
            window.webContents.send(eventName, status);
        };

    const onChangeBounds = (eventName: string) =>
        onChangeFactory(eventName, () => window.getBounds());

    const getFocus = () => ({
        focus: window.isFocused(),
    });
    const getFullscreen = () => ({
        fullscreen: window.isFullScreen(),
    });
    const getMaximized = () => ({
        maximized: window.isMaximized(),
    });
    const getMinimized = () => ({
        minimized: window.isMinimized(),
    });
    const getMaximizable = () => ({
        maximizable: window.isMaximizable(),
    });
    const getMinimizable = () => ({
        minimizable: window.isMinimizable(),
    });
    const getResizable = () => ({
        resizable: window.isResizable(),
    });
    const getMovable = () => ({movable: window.isMovable()});
    const getClosable = () => ({closable: window.isClosable()});

    const onChangeFullScreen = onChangeFactory(
        WINDOW_FULLSCREEN,
        getFullscreen
    );
    const onChangeFocus = onChangeFactory(WINDOW_FOCUS, getFocus);
    const onChangeMinimized = onChangeFactory(
        WINDOW_MINIMIZE,
        combineGetters(getMinimized, getMaximized)
    );
    const onChangeMaximized = onChangeFactory(
        WINDOW_MAXIMIZE,
        combineGetters(getMaximized, getMinimized)
    );

    window.on('resize', onChangeBounds(WINDOW_RESIZE));
    window.on('move', onChangeBounds(WINDOW_MOVE));
    window.on('close', state.save);
    window.on('enter-full-screen', onChangeFullScreen);
    window.on('leave-full-screen', onChangeFullScreen);
    window.on('focus', onChangeFocus);
    window.on('blur', onChangeFocus);
    window.on('maximize', onChangeMaximized);
    window.on('unmaximize', onChangeMaximized);
    window.on('minimize', onChangeMinimized);
    window.on('restore', onChangeMinimized);

    ipcMain.handle(WINDOW_STATE_INIT, (event) => {
        if (event.sender.id === window.webContents.id) {
            try {
                return mergeAll([
                    omit(['save', 'sync'], state),
                    getFocus(),
                    getFullscreen(),
                    getMaximizable(),
                    getMaximized(),
                    getMinimizable(),
                    getMinimized(),
                    getMovable(),
                    getResizable(),
                    getClosable(),
                ]);
            } catch (e) {
                console.log('error');
                console.error(e);
            }
        }
        return null;
    });

    const ipcEvent = (eventName: string, handler: (d: WindowStatus) => void) =>
        ipcMain.on(eventName, (event, data) => {
            if (
                !window.isDestroyed() &&
                event.sender.id === window.webContents.id
            ) {
                handler(data);
            }
        });

    // Some of these depends on the os & desktop environment to work.
    // WARNING Don't put the window method directly, it bug with the ipc.
    ipcEvent(WINDOW_SET_BOUNDS, (data) => window.setBounds(data));
    ipcEvent(WINDOW_SET_FULLSCREEN, (data) =>
        window.setFullScreen(data.fullscreen)
    );
    ipcEvent(WINDOW_SET_RESIZABLE, (data) =>
        window.setResizable(data.resizable)
    );
    ipcEvent(WINDOW_SET_MINIMIZABLE, (data) =>
        window.setMinimizable(data.minimizable)
    );
    ipcEvent(WINDOW_SET_MAXIMIZABLE, (data) =>
        window.setMaximizable(data.maximizable)
    );
    ipcEvent(WINDOW_SET_CLOSABLE, (data) => window.setClosable(data.closable));
    ipcEvent(WINDOW_SET_FOCUS, (data) => {
        if (data.focus) {
            window.focus();
        } else {
            window.blur();
        }
    });
    ipcEvent(WINDOW_SET_MOVABLE, (data) => window.setMovable(data.movable));
    ipcEvent(WINDOW_SET_MINIMIZED, (data) => {
        if (data.minimized) {
            window.minimize();
        } else {
            window.restore();
        }
    });
    ipcEvent(WINDOW_SET_MAXIMIZED, (data) => {
        if (data.maximized) {
            window.maximize();
        } else {
            window.unmaximize();
        }
    });

    ipcEvent(WINDOW_CLOSE, () => {
        window.close();
    });

    return state;
}
