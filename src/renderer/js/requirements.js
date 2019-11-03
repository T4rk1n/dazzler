import {loadCss, loadScript} from '../../commons/js';

export function loadRequirement(requirement) {
    return new Promise((resolve, reject) => {
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

export function loadRequirements(requirements, packages) {
    return new Promise((resolve, reject) => {
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
