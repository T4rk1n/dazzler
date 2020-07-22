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
                components[filepath] = reactDocs.parse(fs.readFileSync(filepath));
            } catch (e) {
                process.stderr.write(`ERROR: Invalid component file ${filepath}`);
            }
        }
    });
    return components;
}

process.stdout.write(JSON.stringify(walk(src)));
