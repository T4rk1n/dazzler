const path = require('path');

module.exports = function(env, argv) {
    return {
        mode: 'production',
        entry: {
            meta: [path.join(__dirname, 'src/internal/meta.js')]
        },
        target: 'node',
        output: {
            path: path.resolve(__dirname, 'dazzler/assets'),
            filename: 'meta.js',
        },
    }
};
