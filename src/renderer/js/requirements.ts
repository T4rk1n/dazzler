import {loadCss, loadScript} from 'commons';
import {Package, Requirement} from './types';

export function loadRequirement(requirement: Requirement) {
    return new Promise<void>((resolve, reject) => {
        const {url, kind, meta} = requirement;
        let method;
        if (kind === 'js') {
            method = loadScript;
        } else if (kind === 'css') {
            method = loadCss;
        } else if (kind === 'map') {
            return resolve();
        } else {
            return reject({error: `Invalid requirement kind: ${kind}`});
        }
        return method(url, meta)
            .then(resolve)
            .catch(reject);
    });
}

export function loadRequirements(
    requirements: Requirement[],
    packages: Package
) {
    return new Promise<void>((resolve, reject) => {
        let loadings = [];
        // Load packages first.
        Object.keys(packages).forEach(pack_name => {
            const pack = packages[pack_name];
            loadings = loadings.concat(pack.requirements.map(loadRequirement));
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
