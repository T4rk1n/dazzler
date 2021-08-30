import {BrowserWindow} from 'electron';
import {createWindowState} from './windowStateSync';
import {CreatePageWindowOptions, PageWindow} from '../common/types';
import path from 'path';

export default async function (
    isDevelopment: boolean,
    pageWindow: PageWindow,
    options: CreatePageWindowOptions
): Promise<BrowserWindow> {
    const {title, url, name} = pageWindow;
    const {save_window_size, window_size} = options;
    const window = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            devTools: isDevelopment,
            preload:
                process.env.DAZZLER_PRELOAD ||
                path.join(__dirname, 'preload-electron.js'),
        },
        title,
        ...window_size,
        ...pageWindow?.window_options,
        show: false,
    });

    const state = await createWindowState(name, window, save_window_size);

    if (save_window_size) {
        state.sync();
    }

    if (pageWindow?.window_options?.menuBar === false) {
        window.setMenu(null);
    }

    await window.loadURL(url);

    return window;
}
