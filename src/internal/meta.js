const reactDocs = require('react-docgen');
const fs = require('fs');
const path = require('path');


const args = process.argv.slice(2);
const src = args[0];

function walk(directory, components=null) {
    return new Promise(resolve => {
        components = components || {};
        fs.readdirSync(src, {withFileTypes: true}).forEach(f => {
           if (f.isDirectory()) {
               components = walk(f, components);
           } else {
               const filepath = path.join(directory, f.name);
               components[filepath] = reactDocs.parse(fs.readFileSync(filepath));
           }
        });
        resolve(components);
    });
}

walk(src).then((components) => {
    process.stdout.write(JSON.stringify(components));
});

