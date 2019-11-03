/* eslint-disable no-magic-numbers */

const jsonPattern = /json/i;

/**
 * @typedef {Object} XhrOptions
 * @property {string} [method='GET']
 * @property {Object} [headers={}]
 * @property {string|Blob|ArrayBuffer|object|Array} [payload='']
 */

/**
 * @type {XhrOptions}
 */
const defaultXhrOptions = {
    method: 'GET',
    headers: {},
    payload: '',
    json: true,
};

export const JSONHEADERS = {
    'Content-Type': 'application/json',
};

/**
 * Xhr promise wrap.
 *
 * Fetch can't do put request, so xhr still useful.
 *
 * Auto parse json responses.
 * Cancellation: xhr.abort
 * @param {string} url
 * @param {XhrOptions} [options]
 * @return {Promise}
 */
export function xhrRequest(url, options = defaultXhrOptions) {
    return new Promise((resolve, reject) => {
        const {method, headers, payload, json} = {
            ...defaultXhrOptions,
            ...options,
        };
        const xhr = new XMLHttpRequest();
        xhr.open(method, url);
        const head = json ? {...JSONHEADERS, ...headers} : headers;
        Object.keys(head).forEach(k => xhr.setRequestHeader(k, head[k]));
        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status < 400) {
                    let responseValue = xhr.response;
                    if (
                        jsonPattern.test(xhr.getResponseHeader('Content-Type'))
                    ) {
                        responseValue = JSON.parse(xhr.responseText);
                    }
                    resolve(responseValue);
                } else {
                    reject({
                        error: 'RequestError',
                        message: `XHR ${url} FAILED - STATUS: ${
                            xhr.status
                        } MESSAGE: ${xhr.statusText}`,
                        status: xhr.status,
                        xhr,
                    });
                }
            }
        };
        xhr.onerror = err => reject(err);
        xhr.send(json ? JSON.stringify(payload) : payload);
    });
}

/**
 * Auto get headers and refresh/retry.
 *
 * @param {function} getHeaders
 * @param {function} refresh
 * @param {string} baseUrl
 */
export function apiRequest(baseUrl = '') {
    return function() {
        const url = baseUrl + arguments[0];
        const options = arguments[1] || {};
        options.headers = {...options.headers};
        return new Promise((resolve) => {
            xhrRequest(url, options)
                .then(resolve)
        });
    };
}
