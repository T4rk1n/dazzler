const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const exec = require('child_process').exec;
const tracker = require('./webpack-asset-tracker');

module.exports = function (env, argv) {
    const mode = (argv && argv.mode) || 'production';
    const devMode = mode === 'development';
    const devtool = devMode ? 'inline-source-map' : undefined;

    const output = {
        filename: 'dazzler_[name]_[contenthash].js',
        sourceMapFilename: 'dazzler_[name]_[contenthash][ext].map',
        library: 'dazzler_[name]',
        libraryTarget: 'umd',
        devtoolModuleFilenameTemplate: 'webpack:///[id]/[resource]?[loaders]',
    };

    if (devMode) {
        output.path = path.join(__dirname, 'dazzler/assets/dev');
    } else {
        output.path = path.join(__dirname, 'dazzler/assets/dist');
    }

    const entry = {
        commons: [
            '@babel/polyfill',
            path.join(__dirname, 'src/commons/js/index.ts'),
        ],
        renderer: {
            import: [path.join(__dirname, 'src/renderer/js/index.tsx')],
            dependOn: 'commons',
        },
        test: [path.join(__dirname, 'src/internal/test_components/index.js')],
        ts: [path.join(__dirname, 'src/internal/ts_components/index.ts')],
        core: {
            import: [path.join(__dirname, 'src/core/js/index.ts')],
            dependOn: 'commons',
        },
        extra: {
            import: [path.join(__dirname, 'src/extra/js/index.ts')],
            dependOn: 'commons',
        },
        markdown: {
            import: [path.join(__dirname, 'src/markdown/js/index.js')],
            dependOn: 'commons',
        },
        calendar: {
            import: [path.join(__dirname, 'src/calendar/js/index.ts')],
            dependOn: 'commons',
        },
        auth: {
            import: [path.join(__dirname, 'src/auth/js/index.ts')],
            dependOn: 'commons',
        },
        html: {
            import: [path.join(__dirname, 'src/html/index.ts')],
            dependOn: 'commons',
        },
        svg: {
            import: [path.join(__dirname, 'src/svg/index.ts')],
            dependOn: 'commons',
        },
        icons: {
            import: [path.join(__dirname, 'src/icons/ts/index.ts')],
            dependOn: 'commons',
        },
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
        tracker({
            path: output.path,
            filename: 'assets.json',
            integrity: !devMode,
        }),
        new MiniCssExtractPlugin({
            filename: 'dazzler_[name]_[contenthash].css',
            chunkFilename: 'dazzler_[name]_[contenthash].css',
        }),
    ];

    if (devMode && argv && argv.watch) {
        plugins.push({
            apply: (compiler) => {
                compiler.hooks.afterEmit.tap('BuildDazzlerPlugin', () => {
                    exec(
                        'npm run build:dazzler::watch',
                        (err, stdout, stderr) => {
                            if (stdout) {
                                process.stdout.write(stdout);
                            }
                            if (stderr) {
                                process.stderr.write(stderr);
                            }
                        }
                    );
                });
            },
        });
    }

    // Check argv is defined first for IDE analyse.
    if (argv && !argv.watch) {
        plugins.push(
            new CleanWebpackPlugin([output.path], {
                verbose: true,
                watch: true,
                exclude: ['dazzler.js'],
            })
        );
    }

    return {
        mode,
        entry,
        output,
        externals,
        target: 'web',

        optimization: {
            splitChunks: {
                // Chunks not working good with dev
                // I think something with the proptypes lib.
                chunks: devMode ? undefined : 'all',
            },
        },

        watchOptions: {
            aggregateTimeout: 500,
            poll: 1000,
        },

        plugins,
        devtool,
        resolve: {
            alias: {
                commons: path.resolve(__dirname, 'src/commons/js/'),
            },
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
                {
                    test: /\.s?css$/,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                            options: {
                                esModule: false,
                            },
                        },
                        {
                            loader: 'css-loader',
                        },
                        {
                            loader: 'sass-loader',
                        },
                    ],
                },
                {
                    test: /\.jsx?$/,
                    loader: 'babel-loader',
                    exclude: /node_modules/,
                },
            ],
        },
    };
};
