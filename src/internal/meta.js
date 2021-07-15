const reactDocs = require('react-docgen');
const fs = require('fs');
const path = require('path');
const args = process.argv.slice(2);
const src = args[0];

function walk(directory, components = {}) {
    fs.readdirSync(src).forEach(f => {
        const filepath = path.join(directory, f);
        if (fs.lstatSync(filepath).isDirectory()) {
            walk(f, components);
        } else {
            try {
                const handlers = reactDocs.defaultHandlers.concat([
                    function(doc, path, importer) {
                        const isContext = reactDocs.utils.getMemberValuePath(
                            path,
                            'isContext',
                            importer
                        );
                        doc.set('isContext', Boolean(isContext));
                    },
                ]);

                components[filepath] = reactDocs.parse(
                    fs.readFileSync(filepath),
                    null,
                    handlers
                );
            } catch (err) {
                process.stderr.write(
                    `ERROR: Invalid component file ${filepath}: ${err}`
                );
            }
        }
    });
    return components;
}

process.stdout.write(JSON.stringify(walk(src), null, 2));
