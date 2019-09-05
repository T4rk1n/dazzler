import {includes, toPairs, pluck} from 'ramda';

export function toTimestamp(date) {
    return parseInt((date.getTime() / 1000).toFixed(0));
}

export const timestampProp = (prop_name, value) => {
    const payload = {};
    payload[prop_name] = value;
    payload[`${prop_name}_timestamp`] = toTimestamp(new Date());
    return payload;
};

export function loadScript(uri, timeout = 3000) {
    return new Promise((resolve, reject) => {
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

export function loadCss(uri, timeout = 3000) {
    return new Promise((resolve, reject) => {
        let timeoutId;
        const onload = () => {
            clearTimeout(timeoutId);
            resolve(uri);
        };
        document.querySelector('head');
        const attributes = {
            rel: 'stylesheet',
            type: 'text/css',
            href: uri,
            media: 'all',
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

export function debounce(func, wait) {
    let timeout, lastCall;
    return function() {
        const now = new Date();
        if (!lastCall) {
            lastCall = now;
        }
        const later = () => {
            timeout = null;
            func.apply(this, arguments);
            lastCall = new Date();
        };
        clearTimeout(timeout);
        const diff = now - lastCall;
        if (diff >= wait) {
            func.apply(this, arguments);
            lastCall = now;
        } else {
            timeout = setTimeout(later, diff);
        }
    };
}

export function collectTruePropKeys(obj, filterKeys) {
    let pairs = toPairs(obj);
    if (filterKeys) {
        pairs = pairs.filter(([k, _]) => includes(k, filterKeys));
    }
    return pluck(0, pairs.filter(([_, v]) => v));
}

export function chunk(arr, n) {
    return arr
        .map((item, index) =>
            index % n === 0 ? arr.slice(index, index + n) : null
        )
        .filter(item => item);
}
