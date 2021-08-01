import child_process from 'child_process';
import {join} from 'ramda';
import {net} from 'electron';
import path from 'path';
import logger from './logger';
import process from 'process';
let serverProcess;

function requestConfigs(serverUrl: string): Promise<ElectronConfig> {
    return new Promise<ElectronConfig>((resolve, reject) => {
        logger.server.info('Requesting configs');
        const request = net.request(`${serverUrl}/dazzler/electron-config`);
        request.on('response', (response) => {
            const chunks = [];
            response.on('data', (chunk) => {
                chunks.push(chunk);
            });
            response.on('end', () => {
                const configs = JSON.parse(join('', chunks));
                logger.server.info('Configs', configs);
                resolve(configs);
            });
        });
        request.on('error', (error) => {
            logger.server.error(error);
            reject(error);
        });
        request.end();
    });
}

function getProcesses(
    pid: number,
    // eslint-disable-next-line no-unused-vars
    spawner: (pid: number) => any
): Promise<number[]> {
    return new Promise((resolve) => {
        const chunks = [];
        const ps = spawner(pid);
        ps.stdout.on('data', (chunk) => {
            chunks.push(chunk);
        });
        ps.on('close', () => {
            const pids = join(
                '',
                chunks.map((c) => `${c}`)
            )
                .trim()
                .split(' ')
                .map((p) => Number.parseInt(p));
            resolve(pids.concat(pid));
        });
    });
}

function killProcesses(processes: number[]) {
    processes.forEach((p) => {
        logger.server.debug(`Kill process: ${p}`);
        process.kill(p, 'SIGKILL');
    });
}

export function closeServer(): Promise<any> {
    return new Promise((resolve, reject) => {
        const pid = serverProcess.pid;
        // eslint-disable-next-line default-case
        switch (process.platform) {
            case 'win32':
                child_process.exec(`taskkill /pid ${pid} /T /F`, (error) => {
                    if (error) {
                        logger.server.error(error);
                        reject(error);
                    } else {
                        logger.server.debug('task killed');
                        resolve(null);
                    }
                });
                break;
            case 'darwin':
                getProcesses(pid, (p) =>
                    // @ts-ignore
                    child_process.spawn('pgrep', ['-P', p])
                ).then((processes) => {
                    killProcesses(processes);
                    resolve(null);
                });
                break;
            case 'linux':
                getProcesses(pid, (p) =>
                    child_process.spawn('ps', [
                        '-o',
                        'pid',
                        '--no-headers',
                        '--ppid',
                        // @ts-ignore
                        p,
                    ])
                ).then((processes) => {
                    killProcesses(processes);
                    resolve(null);
                });
                break;
        }
    });
}

export default function (
    isDevelopment,
    applicationFile,
    serverUrl,
    ...args
): Promise<ElectronConfig> {
    return new Promise((resolve, reject) => {
        if (isDevelopment) {
            serverProcess = child_process.spawn('python', [
                applicationFile,
                ...args,
            ]);
        } else {
            serverProcess = child_process.spawn(
                path.join(process.resourcesPath, applicationFile),
                [...args]
            );
        }

        serverProcess.on('spawn', () => {
            logger.server.debug('Successfully spawned server process');
        });

        serverProcess.on('error', (err) => {
            logger.server.error('Error spawning process', err);
            reject(err);
        });

        serverProcess.stdout.on('data', (data) => {
            const d = `${data}`;
            console.log(d);
        });
        serverProcess.stderr.on('data', (data) => {
            const d = `${data}`;
            console.log(d);
            if (/Started server/.test(d)) {
                requestConfigs(serverUrl).then(resolve).catch(reject);
            }
        });
        serverProcess.on('close', (code) => {
            logger.server.info(`Server closed with code: ${code}`);
        });
    });
}
