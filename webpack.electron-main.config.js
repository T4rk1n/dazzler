const path = require('path');

module.exports = function(env, argv) {
    const mode = (argv && argv.mode) || 'production';
    const devMode = mode === 'development';
    const devtool = devMode ? 'inline-source-map' : undefined;

    const output = {
        filename: 'electron-dazzler.js',
        path: path.join(__dirname, 'dazzler/assets/'),
    };
    const entry = [path.join(__dirname, 'src/electron/main/index.ts')];

    return {
        mode,
        devtool,
        target: 'electron-main',
        entry,
        output,
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
