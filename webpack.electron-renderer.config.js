const path = require('path');
const tracker = require('./webpack-asset-tracker');

module.exports = function(env, argv) {
    const mode = (argv && argv.mode) || 'production';
    const devMode = mode === 'development';
    const devtool = devMode ? 'inline-source-map' : undefined;

    const output = {
        filename: 'dazzler_[name]_[contenthash].js',
        sourceMapFilename: 'dazzler_[name]_[contenthash][ext].map',
        library: 'dazzler_[name]',
        libraryTarget: 'umd',
        devtoolModuleFilenameTemplate: 'webpack:///[id]/[resource]?[loaders]',
        globalObject: 'self'
    };
    const entry = {
        electron: [path.join(__dirname, 'src/electron/renderer/index.ts')]
    };

    if (devMode) {
        output.path = path.join(__dirname, 'dazzler/assets/electron/dev');
    } else {
        output.path = path.join(__dirname, 'dazzler/assets/electron/dist');
    }

    const plugins = [
        tracker({
            path: output.path,
            filename: 'assets.json',
            integrity: false,
        }),
    ];

    const externals = {
        react: {
            commonjs: 'react',
            commonjs2: 'react',
            amd: 'react',
            umd: 'react',
            root: 'React',
        },
        'react-dom': {
            commonjs: 'react-dom',
            commonjs2: 'react-dom',
            amd: 'react-dom',
            umd: 'react-dom',
            root: 'ReactDOM',
        },
    };

    return {
        mode,
        devtool,
        target: 'electron-renderer',
        entry,
        output,
        plugins,
        externals,
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
