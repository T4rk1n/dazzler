import {BrowserWindow} from 'electron';
import {promises as fs} from 'fs';
import path from 'path';
import logger from './logger';
import {LoadingWindowOptions} from '../common/types';

export async function createLoadingWindow(
    windowFile: string,
    isCompiled: boolean,
    windowOptionsFile: string
): Promise<Electron.BrowserWindow> {
    let optionsPath = windowOptionsFile;
    let windowPath = windowFile;
    if (isCompiled) {
        optionsPath = path.join(__dirname, windowOptionsFile);
        windowPath = path.join(__dirname, windowFile);
    }

    logger.main.debug(`[loading] Window path: ${windowPath}`);
    logger.main.debug(`[loading] Window options path: ${optionsPath}`);
    const optionsContent = await fs.readFile(optionsPath);
    // @ts-ignore
    const windowOptions: LoadingWindowOptions = JSON.parse(optionsContent);
    logger.main.debug(`[loading] Window options:\n ${optionsContent}`);
    const window = new BrowserWindow({
        ...windowOptions,
        webPreferences: {
            nodeIntegration: false,
        },
        show: false,
    });
    window.on('ready-to-show', () => window.show());
    if (windowOptions.click_through) {
        window.setIgnoreMouseEvents(true);
    }
    await window.loadFile(windowPath);
    return window;
}
