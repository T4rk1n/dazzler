import {loadCss, loadScript} from 'commons';
import {Package, Requirement} from './types';
import {drop} from 'ramda';

export function loadRequirement(requirement: Requirement) {
    return new Promise<void>((resolve, reject) => {
        const {url, kind} = requirement;
        let method;
        if (kind === 'js') {
            method = loadScript;
        } else if (kind === 'css') {
            method = loadCss;
        } else if (kind === 'map') {
            return resolve();
        } else {
            return reject(`Invalid requirement kind: ${kind}`);
        }
        return method(url).then(resolve).catch(reject);
    });
}

function loadOneByOne(requirements: Requirement[]) {
    return new Promise((resolve) => {
        const handle = (reqs) => {
            if (reqs.length) {
                const requirement = reqs[0];
                loadRequirement(requirement).then(() => handle(drop(1, reqs)));
            } else {
                resolve(null);
            }
        };
        handle(requirements);
    });
}

export function loadRequirements(
    requirements: Requirement[],
    packages: {[k: string]: Package}
) {
    return new Promise<void>((resolve, reject) => {
        let loadings = [];
        Object.keys(packages).forEach((pack_name) => {
            const pack = packages[pack_name];
            loadings = loadings.concat(
                loadOneByOne(pack.requirements.filter((r) => r.kind === 'js'))
            );
            loadings = loadings.concat(
                pack.requirements
                    .filter((r) => r.kind === 'css')
                    .map(loadRequirement)
            );
        });
        // Then load requirements so they can use packages
        // and override css.
        Promise.all(loadings)
            .then(() => {
                let i = 0;
                // Load in order.
                const handler = () => {
                    if (i < requirements.length) {
                        loadRequirement(requirements[i]).then(() => {
                            i++;
                            handler();
                        });
                    } else {
                        resolve();
                    }
                };
                handler();
            })
            .catch(reject);
    });
}
