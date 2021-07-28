import {app, BrowserWindow} from 'electron';
import dotenv from 'dotenv';
import path from 'path';
import {values} from 'ramda';
import logger from './logger';
import createPageWindow from './pageWindow';
import createServer, {closeServer} from './server';
import {createLoadingWindow} from './loadingWindow';

const envPath = path.join(process.resourcesPath, '.env');
logger.main.info(`Env: ${envPath}`);

dotenv.config({path: envPath});

const isDevelopment = process.env.NODE_ENV !== 'production';
const port = process.env.DAZZLER_PORT || 8150;
const appFile = process.env.DAZZLER_APP;
const isInstalled = process.env.DAZZLER_COMPILED === 'True';
const loadingWindowFile = process.env.DAZZLER_LOADING_WINDOW_FILE;
const loadingWindowOptions = process.env.DAZZLER_LOADING_WINDOW_OPTIONS;

const serverUrl = `http://localhost:${port}`;

const windows: {[key: string]: BrowserWindow} = {};

async function setup() {
    let loadingWindow: BrowserWindow;
    if (loadingWindowFile) {
        loadingWindow = await createLoadingWindow(
            loadingWindowFile,
            isInstalled,
            loadingWindowOptions
        );
    }

    const config = await createServer(!isInstalled, appFile, serverUrl);

    for (const page of config.windows) {
        logger.main.info(`Create window : ${page.name}`);
        windows[page.name] = await createPageWindow(
            isDevelopment,
            {...page, url: `${serverUrl}${page.url}`},
            config
        );
    }
    if (loadingWindow) {
        loadingWindow.close();
    }

    values(windows).forEach(window => window.show());
}

let closed = false;

app.on('ready', setup);
app.on('will-quit', async event => {
    logger.main.debug(`will-quit closed=${closed}`);
    if (!closed) {
        logger.main.debug('Will quit: closing server');
        event.preventDefault();
        try {
            await closeServer();
            logger.main.debug('Server closed');
        } catch (err) {
            logger.main.error(err);
        }
        closed = true;
        app.quit();
    }
});
