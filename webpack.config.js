const path = require('path');
const BundleTracker = require('webpack-bundle-tracker');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const exec = require('child_process').exec;


module.exports = function(env, argv) {
    const mode = argv && argv.mode || 'production';
    const devMode = mode === 'development';
    const devtool = mode === 'development' ? 'inline-source-map' :'source-map';

    const output = {
        filename: 'dazzler_[name]_[hash].js',
        sourceMapFilename: 'dazzler_[name]_[hash].js.map',
        library: 'dazzler_[name]',
        libraryTarget: 'umd',
    };

    if (devMode) {
        output.path = path.join(__dirname, 'dazzler/assets/dev');
    } else {
        output.path = path.join(__dirname, 'dazzler/assets/dist');
    }

    const entry = {
        commons: [
            '@babel/polyfill',
            path.join(__dirname, 'src/commons/js/index.js'),
        ],
        renderer: [path.join(__dirname, 'src/renderer/js/index.js')],
        test: [
            path.join(
                __dirname,
                'src/internal/test_components/index.js'
            ),
        ],
        core: [path.join(__dirname, 'src/core/js/index.js')],
        extra: [path.join(__dirname, 'src/extra/js/index.js')],
        markdown: [path.join(__dirname, 'src/markdown/js/index.js')],
        calendar: [path.join(__dirname, 'src/calendar/js/index.js')],
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

    const plugins = [
        new BundleTracker({
            path: output.path,
            filename: 'assets.json',
        }),
        new CleanWebpackPlugin([output.path], {
            verbose: true,
            watch: true,
            exclude: ['dazzler.js'],
        }),
        new MiniCssExtractPlugin({
            filename: 'dazzler_[name]_[hash].css',
            chunkFilename: 'dazzler_[name]_[hash].css',
        }),
    ];

    if (devMode) {
        plugins.push({
            apply: (compiler => {
                compiler.hooks.afterEmit.tap('BuildDazzlerPlugin', () => {
                    exec('npm run build:dazzler', (err, stdout, stderr) => {
                        if (stdout) process.stdout.write(stdout);
                        if (stderr) process.stderr.write(stderr);
                    })
                })
            })
        })
    }

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

        watchOptions: {
            aggregateTimeout: 500,
            poll: 1000,
        },

        plugins,
        devtool,
        module: {
            rules: [
                {
				test: /\.s?css$/,
				use: [
                        'style-loader',
                        MiniCssExtractPlugin.loader,
                        {
                            loader: "css-loader",
                        },
                        {
                            loader: "sass-loader"
                        }
                ]
                },
                {
                    test: /\.jsx?$/,
                    loader: ['babel-loader'],
                    exclude: /node_modules/,
                    resolve: {
                        extensions: ['.js', '.jsx'],
                    },
                },
            ],
        },
    };
};
