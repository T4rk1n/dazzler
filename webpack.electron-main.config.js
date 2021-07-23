const path = require('path');
const Tracker = require('./webpack-asset-tracker');

module.exports = function(env, argv) {
    const mode = (argv && argv.mode) || 'production';
    const devMode = mode === 'development';
    const devtool = mode === 'development' ? 'inline-source-map' : undefined;

    const output = {
        filename: 'electron-dazzler.js',
        path: path.join(__dirname, 'dazzler/assets/'),
    };
    const entry = [path.join(__dirname, 'src/electron/main/index.ts')];

    const plugins = [
        Tracker({
            path: output.path,
            filename: 'electron-assets.json',
            integrity: false,
        }),
    ];

    return {
        mode,
        devtool,
        target: 'electron-main',
        entry,
        output,
        plugins,
        resolve: {
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
            ],
        },
    };
};
