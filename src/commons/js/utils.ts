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

export function loadScript(uri: string, timeout = 3000) {
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
        Object.keys(attributes).forEach(k =>
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
        element.setAttribute('disabled', 'disabled');
        element.id = null;
    }
}

export function loadCss(uri: string, timeout = 3000) {
    return new Promise((resolve, reject) => {
        /* eslint-disable prefer-const */
        let timeoutId;
        const onload = () => {
            clearTimeout(timeoutId);
            resolve(uri);
        };
        disableCss(uri);
        const attributes = {
            rel: 'stylesheet',
            type: 'text/css',
            href: uri,
            media: 'all',
            id: `css-${uri}`,
        };
        const element = document.createElement('link');
        Object.keys(attributes).forEach(k =>
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

export function debounce(func: Function, wait: number) {
    let timeout, lastCall;
    return function() {
        const now = new Date();
        if (!lastCall) {
            lastCall = now;
        }
        const later = () => {
            timeout = null;
            /* eslint-disable no-invalid-this */
            // @ts-ignore
            func.apply(this, arguments);
            lastCall = new Date();
        };
        clearTimeout(timeout);
        // @ts-ignore
        const diff = now - lastCall;
        if (diff >= wait) {
            /* eslint-disable no-invalid-this */
            func.apply(this, arguments);
            lastCall = now;
        } else {
            timeout = setTimeout(later, diff);
        }
    };
}

export function collectTruePropKeys(obj: object, filterKeys: string[]) {
    let pairs = toPairs(obj);
    if (filterKeys) {
        // @ts-ignore
        pairs = pairs.filter(([k, _]) => includes(k, filterKeys));
    }
    // @ts-ignore
    return pluck(0, pairs.filter(([_, v]) => v));
}

export function chunk(arr: any[], n: number): Array<Array<any>> {
    return arr
        .map((item, index) =>
            index % n === 0 ? arr.slice(index, index + n) : null
        )
        .filter(item => item);
}
