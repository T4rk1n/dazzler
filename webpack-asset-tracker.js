const fs = require('fs');
const path = require('path');
const R = require('ramda');
const crypto = require('crypto');
const name = 'BundleTracker';

const plugin = ({path: output, filename, integrity, algorithm = 'sha384'}) => ({
    apply: compiler => {
        compiler.hooks.done.tap(name, (stats, ...args) => {
            if (stats.hasErrors()) return;
            const assets = R.reduce(
                (acc, chunkGroup) => {
                    const files = chunkGroup.getFiles();
                    acc[chunkGroup.name] = R.map((file) => {
                        const asset = {name: file};
                        if (integrity) {
                            const fileContent = fs.readFileSync(
                                path.join(
                                    output,
                                    file
                                )
                            );
                            const hash = crypto
                                .createHash(algorithm)
                                .update(fileContent, 'utf8')
                                .digest('base64');

                            asset.integrity = `${algorithm}-${hash}`
                        }
                        return asset;
                    }, files);
                    return acc;
                },
                {},
                stats.compilation.chunkGroups
            );

            fs.writeFile(
                path.join(output, filename),
                JSON.stringify(assets),
                err => {
                    if (err) process.stderr.write(`BundleTrackerError: ${err}`);
                }
            );
        });
    },
});
module.exports = plugin;
