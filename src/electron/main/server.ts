import child_process from 'child_process';
import {join} from 'ramda';
import {net} from 'electron';
import path from 'path';

import logger from './logger';
import ElectronConfig = dazzler_electron.ElectronConfig;

let serverProcess;

function requestConfigs(serverUrl: string): Promise<ElectronConfig> {
    return new Promise<ElectronConfig>((resolve, reject) => {
        logger.server.info('Requesting configs');
        const request = net.request(`${serverUrl}/dazzler/electron-config`);
        request.on('response', response => {
            const chunks = [];
            response.on('data', chunk => {
                chunks.push(chunk);
            });
            response.on('end', () => {
                const configs = JSON.parse(join('', chunks));
                logger.server.info('Configs', configs);
                resolve(configs);
            });
        });
        request.on('error', error => {
            logger.server.error(error);
            reject(error);
        });
        request.end();
    });
}

export function closeServer() {
    if (serverProcess) {
        const status = serverProcess.kill();
        logger.server.info(`Server killed with status: ${status}`);
    }
}

export default function(
    isDevelopment,
    applicationFile,
    serverUrl,
    ...args
): Promise<dazzler_electron.ElectronConfig> {
    return new Promise((resolve, reject) => {
        if (isDevelopment) {
            serverProcess = child_process.spawn('python', [
                applicationFile,
                ...args,
            ]);
        } else {
            // TODO investigate `.exe` files support on windows.
            //  Docs says it can't do IO so would need another solution for
            //  asserting the server started and can receive requests.
            serverProcess = child_process.spawn(
                path.join(process.resourcesPath, applicationFile),
                [...args]
            );
        }

        serverProcess.on('spawn', () => {
            logger.server.debug('Successfully spawned server process');
        });

        serverProcess.on('error', err => {
            logger.server.error('Error spawning process', err);
            reject(err);
        });

        serverProcess.stdout.on('data', data => {
            const d = `${data}`;
            logger.server.info(d);
        });
        serverProcess.stderr.on('data', data => {
            const d = `${data}`;
            if (/Started server/.test(d)) {
                requestConfigs(serverUrl)
                    .then(resolve)
                    .catch(reject);
            }
        });
        serverProcess.on('close', code => {
            logger.server.info(`[server] Server closed with code: ${code}`);
        });
    });
}
