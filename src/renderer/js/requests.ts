/* eslint-disable no-magic-numbers */

import {XhrRequestOptions} from './types';

const jsonPattern = /json/i;

const defaultXhrOptions: XhrRequestOptions = {
    method: 'GET',
    headers: {},
    payload: '',
    json: true,
};

export const JSONHEADERS = {
    'Content-Type': 'application/json',
};

export function xhrRequest(
    url: string,
    options: XhrRequestOptions = defaultXhrOptions
) {
    return new Promise<any>((resolve, reject) => {
        const {method, headers, payload, json} = {
            ...defaultXhrOptions,
            ...options,
        };
        const xhr = new XMLHttpRequest();
        xhr.open(method, url);
        const head = json ? {...JSONHEADERS, ...headers} : headers;
        Object.keys(head).forEach((k) => xhr.setRequestHeader(k, head[k]));
        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
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
                        message: `XHR ${url} FAILED - STATUS: ${xhr.status} MESSAGE: ${xhr.statusText}`,
                        status: xhr.status,
                        xhr,
                    });
                }
            }
        };
        xhr.onerror = (err) => reject(err);
        // @ts-ignore
        xhr.send(json ? JSON.stringify(payload) : payload);
    });
}

export function apiRequest(baseUrl: string) {
    return function () {
        const url = baseUrl + arguments[0];
        const options = arguments[1] || {};
        options.headers = {...options.headers};
        return new Promise((resolve) => {
            xhrRequest(url, options).then(resolve);
        });
    };
}
