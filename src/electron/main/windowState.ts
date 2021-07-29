import {app, BrowserWindow} from 'electron';
import {promises as fs} from 'fs';
import * as path from 'path';
import {debounce} from '../../commons/js/utils';
import {omit} from 'ramda';

const WINDOW_RESIZE = 'WINDOW_RESIZE';
const WINDOW_MOVE = 'WINDOW_MOVE';
const WINDOW_FULLSCREEN = 'WINDOW_FULLSCREEN';

const appData = app.getPath('userData');

interface WindowState {
    name: string;
    x?: number;
    y?: number;
    width: number;
    height: number;
    fullscreen: boolean;
    save(): void;
    sync(): void;
}

function getWindowStateFileName(name: string): string {
    return path.join(appData, `${name}.state.json`);
}

async function saveWindowState(state: WindowState) {
    await fs.writeFile(
        getWindowStateFileName(state.name),
        JSON.stringify(state)
    );
}

export async function createWindowState(
    windowName: string,
    window: BrowserWindow
): Promise<WindowState> {
    let state: WindowState;
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
            save() {},
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

    // Track change and save them.
    const onChangeFactory = (eventName: string) => () => {
        const newBounds = window.getBounds();
        state.x = newBounds.x;
        state.y = newBounds.y;
        state.width = newBounds.width;
        state.height = newBounds.height;
        state.fullscreen = window.isFullScreen();
        state.save();
        window.webContents.send(eventName, omit(['save', 'sync'], state));
    };

    window.on('resize', onChangeFactory(WINDOW_RESIZE));
    window.on('move', onChangeFactory(WINDOW_MOVE));
    window.on('close', state.save);
    window.on('enter-full-screen', onChangeFactory(WINDOW_FULLSCREEN));

    return state;
}
