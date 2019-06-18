const path = require('path');
const BundleTracker = require('webpack-bundle-tracker');
const ExtractText = require('extract-text-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = function(env, argv) {
    const mode = argv && argv.mode || 'production';
    const devMode = mode === 'development';
    const devtool = 'source-map';

    const output = {
        filename: 'dazzler_[name]_[hash].js',
        sourceMapFilename: 'dazzler_[name]_[hash].js.map',
        library: 'dazzler_[name]',
        libraryTarget: 'umd',
    };

    if (devMode) {
        output.path = path.join(__dirname, 'assets/dev');
    } else {
        output.path = path.join(__dirname, 'assets/dist');
    }

    const entry = {
        commons: [
            '@babel/polyfill',
            path.join(__dirname, 'assets/src/commons/js/index.js'),
        ],
        renderer: [path.join(__dirname, 'assets/src/renderer/js/index.js')],
        test: [
            path.join(
                __dirname,
                'assets/src/internal/test_components/index.js'
            ),
        ],
        core: [path.join(__dirname, 'assets/src/core/js/index.js')],
        extra: [path.join(__dirname, 'assets/src/extra/js/index.js')],
    };

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
        entry,
        output,
        externals,

        optimization: {
            splitChunks: {
                cacheGroups: {
                    commons: {
                        name: 'commons',
                        chunks: 'all',
                        minChunks: 2,
                    },
                },
            },
        },

        plugins: [
            new BundleTracker({
                path: output.path,
                filename: 'assets.json',
            }),
            new CleanWebpackPlugin([output.path], {
                verbose: true,
                exclude: ['dazzler.js'],
            }),
            new ExtractText({
                filename: 'dazzler_[name]-[hash].css',
            }),
        ],
        devtool,
        module: {
            rules: [
                {
                    test: /\.jsx?$/,
                    loader: ['babel-loader'],
                    exclude: /node_modules/,
                    resolve: {
                        extensions: ['.js', '.jsx'],
                    },
                },
                {
                    test: /\.css$/,
                    loader: ['style-loader', 'css-loader'],
                },
                {
                    test: /\.scss$/,
                    use: ExtractText.extract({
                        fallback: 'style-loader',
                        use: ['css-loader', 'sass-loader'],
                    }),
                },
            ],
        },
    };
};
