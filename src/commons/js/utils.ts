import {includes, toPairs, pluck} from 'ramda';

export function toTimestamp(date: Date): number {
    return parseInt((date.getTime() / 1000).toFixed(0));
}

export const timestampProp = (prop_name: string, value: any) => {
    const payload = {};
    payload[prop_name] = value;
    payload[`${prop_name}_timestamp`] = toTimestamp(new Date());
    return payload;
};

export function loadScript(uri: string, timeout = 30000) {
    return new Promise((resolve, reject) => {
        /* eslint-disable prefer-const */
        let timeoutId;
        const onload = () => {
            clearTimeout(timeoutId);
            resolve(uri);
        };

        const attributes = {
            src: uri,
            async: true,
        };
        const element = document.createElement('script');
        Object.keys(attributes).forEach((k) =>
            element.setAttribute(k, attributes[k])
        );
        element.onload = onload;

        timeoutId = setTimeout(() => {
            element.src = '';
            reject({error: `${uri} did not load after ${timeout}ms`});
        }, timeout);

        document.querySelector('body').appendChild(element);
    });
}

export function disableCss(uri: string) {
    const element = document.getElementById(`css-${uri}`);
    if (element) {
        element.parentNode.removeChild(element);
        return true;
    }
    return false;
}

export function loadCss(uri: string, timeout = 30000) {
    return new Promise((resolve, reject) => {
        /* eslint-disable prefer-const */
        let timeoutId;
        const onload = () => {
            clearTimeout(timeoutId);
            resolve(uri);
        };
        let href = uri;
        if (disableCss(uri)) {
            href = `${uri}?v=${new Date().getTime()}`;
        }
        const attributes = {
            rel: 'stylesheet',
            type: 'text/css',
            href,
            media: 'all',
            id: `css-${uri}`,
        };
        const element = document.createElement('link');
        Object.keys(attributes).forEach((k) =>
            element.setAttribute(k, attributes[k])
        );
        element.onload = onload;

        timeoutId = setTimeout(() => {
            element.href = '';
            reject({error: `${uri} did not load after ${timeout}ms`});
        }, timeout);

        document.querySelector('head').appendChild(element);
    });
}

export function debounce(func: Function, wait: number, immediate?: boolean) {
    let timeout, lastCall;
    // eslint-disable-next-line consistent-return
    return function () {
        const now = new Date();
        if (!lastCall) {
            lastCall = now;
            if (immediate) {
                /* eslint-disable no-invalid-this */
                return func.apply(this, arguments);
            }
        }
        const later = () => {
            console.log('later');
            timeout = null;
            /* eslint-disable no-invalid-this */
            lastCall = new Date();
            // @ts-ignore
            return func.apply(this, arguments);
        };
        clearTimeout(timeout);
        // @ts-ignore
        const diff = now - lastCall;
        if (diff >= wait) {
            /* eslint-disable no-invalid-this */
            lastCall = now;
            return func.apply(this, arguments);
        }
        timeout = setTimeout(later, diff);
    };
}

/**
 * Throttle execution of a function
 *
 * @param func Function to throttle execution of, the last arguments given
 * will be applied. Resolves all calls with the value.
 * @param delay Delay to wait before execution.
 * @param resetTimerOnCall Reset the time to wait before execution on each call.
 */
export function throttle<T>(
    func: (...a) => T,
    delay: number,
    resetTimerOnCall?: boolean
) {
    let firstCall: Date,
        timeout: number,
        resolvers: ((val) => void)[] = [];
    return function (...args) {
        const now = new Date();
        if (timeout) {
            clearTimeout(timeout);
        }
        const prom = new Promise<T>((resolve) => {
            resolvers.push(resolve);
        });
        if (!firstCall || resetTimerOnCall) {
            firstCall = new Date();
        }
        const finish = () => {
            const value = func(...args);
            firstCall = null;
            timeout = null;
            resolvers.forEach((resolve) => resolve(value));
        };
        const diff = now.getTime() - firstCall.getTime();
        // @ts-ignore
        timeout = setTimeout(finish, delay - diff);

        return prom;
    };
}

export function collectTruePropKeys(
    obj: object,
    filterKeys: string[]
): string[] {
    let pairs = toPairs(obj);
    if (filterKeys) {
        // @ts-ignore
        pairs = pairs.filter(([k, _]) => includes(k, filterKeys));
    }

    return pluck(
        0,
        // @ts-ignore
        pairs.filter(([_, v]) => v)
    );
}

export function chunk(arr: any[], n: number): Array<Array<any>> {
    return arr
        .map((item, index) =>
            index % n === 0 ? arr.slice(index, index + n) : null
        )
        .filter((item) => item);
}
