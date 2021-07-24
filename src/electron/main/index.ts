import {app, BrowserWindow} from 'electron';
import dotenv from 'dotenv';
import path from 'path';
import logger from './logger';
import createPageWindow from './pageWindow';
import createServer, {closeServer} from './server';

const envPath = path.join(process.resourcesPath, '.env');
logger.main.info(`Env: ${envPath}`);

dotenv.config({path: envPath});

const isDevelopment = process.env.NODE_ENV !== 'production';
const port = process.env.DAZZLER_PORT || 8150;
const appFile = process.env.DAZZLER_APP;
const isInstalled = process.env.DAZZLER_COMPILED === 'True';

const serverUrl = `http://localhost:${port}`;

let windows: {[key: string]: BrowserWindow} = {};

async function setup() {
    const config = await createServer(!isInstalled, appFile, serverUrl);

    for (const page of config.windows) {
        logger.main.info(`Create window : ${page.name}`);
        windows[page.name] = await createPageWindow(
            isDevelopment,
            {...page, url: `${serverUrl}${page.url}`},
            config
        );
    }
}

app.on('ready', setup);
app.on('will-quit', () => {
    logger.main.info('Will quit: closing server');
    closeServer();
});
