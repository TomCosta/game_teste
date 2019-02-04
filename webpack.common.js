const {CheckerPlugin} = require('awesome-typescript-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const {TsConfigPathsPlugin} = require('awesome-typescript-loader');

module.exports = {
    entry: {
        index: './src/scripts/index.ts',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: ['source-map-loader'],
                enforce: 'pre'
            }
        ]
    },
    devtool: 'source-map',
    plugins: [
        new CheckerPlugin(),
        new HtmlWebpackPlugin({
            title: 'My PIXI App',
            template: 'src/html/index.html',
            hash: true,
            minify: {
                collapseWhitespace: true
            }
        })
    ],
    externals: {
        'pixi.js': 'PIXI',
    },
    resolve: {
        extensions: ['.js', '.ts', '.tsx', '.css', '.scss', '.json'],
        modules: ['node_modules'],
        alias: {
            'styles': path.resolve(__dirname, 'src/styles/'),
            'pixi-particles': path.resolve(__dirname, 'src/scripts/vendor/pixijs/pixi-particles/pixi-particles'),
        },
        plugins: [
            new TsConfigPathsPlugin()
        ],
    },
    stats: 'verbose',
};