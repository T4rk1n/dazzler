const path = require('path');

module.exports = function(env, argv) {
    return {
        mode: 'production',
        entry: {
            meta: [path.join(__dirname, 'src/internal/meta.js')],
            // FIXME Compiled version of meta-ts doesn't work properly with
            //  arrayOf types, they get shape instead.
            //"meta-ts": [path.join(__dirname, 'src/internal/meta-ts.js')]
        },
        target: 'node',
        output: {
            path: path.resolve(__dirname, 'dazzler/assets'),
            filename: '[name].js',
        },
    }
};
