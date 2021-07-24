import {BrowserWindow} from 'electron';
import installExtension, {
    REACT_DEVELOPER_TOOLS,
} from 'electron-devtools-installer';
import PageWindow = dazzler_electron.PageWindow;
import CreatePageWindowOptions = dazzler_electron.CreatePageWindowOptions;
import {createWindowState} from './windowState';

export default async function(
    isDevelopment: boolean,
    pageWindow: PageWindow,
    options: CreatePageWindowOptions
): Promise<BrowserWindow> {
    const {title, url, name} = pageWindow;
    const {save_window_size, window_size} = options;
    const window = new BrowserWindow({
        webPreferences: {
            devTools: isDevelopment,
        },
        title,
        ...window_size,
    });

    if (save_window_size) {
        const state = await createWindowState(name, window);
        state.sync();
    }

    await window.loadURL(url);

    if (isDevelopment) {
        await installExtension(REACT_DEVELOPER_TOOLS);
    }

    return window;
}
