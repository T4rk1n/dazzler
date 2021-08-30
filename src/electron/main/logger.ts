export class Logger {
    channel: string;
    constructor(channel: string) {
        this.channel = channel;
    }

    log(level: string, message: string, ...args: any[]) {
        const newLevel = level === 'debug' ? 'log' : level;
        console[newLevel](this.format(level, message), ...args);
    }

    format(level: string, message: string) {
        return `[${this.channel}][${level}] ${message}`;
    }

    debug(message, ...args) {
        return this.log('debug', message, ...args);
    }
    info(message, ...args) {
        return this.log('info', message, ...args);
    }
    error(message, ...args) {
        return this.log('error', message, ...args);
    }
    warn(message, ...args) {
        return this.log('warn', message, ...args);
    }
}

const logger = {
    main: new Logger('main'),
    server: new Logger('server'),
};

export default logger;
