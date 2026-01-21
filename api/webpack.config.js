const path = require('path');
const NodemonPlugin = require('nodemon-webpack-plugin');
const NODE_ENV = 'production'; //'development';
const nodeExternals = require('webpack-node-externals');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
    watch: NODE_ENV === 'development',
    entry: './index.ts',
    mode: NODE_ENV,
    target: 'node',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js'
    },
    watchOptions: {
        aggregateTimeout: 1000,
        poll: 1000,
        ignored: ['**/node_modules', '**/dist', '**/client']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: ['ts-loader']
            }
        ]
    },
    externals: [nodeExternals()],
    resolve: {
        extensions: ['.ts', '.js']
    },
    plugins: [
        // new BundleAnalyzerPlugin()
        new NodemonPlugin({
            script: './dist/index.js',
            watch: path.resolve('./dist'),
            ignore: ['*.js.map'],
            ext: 'js,njk,json',
            delay: '1000',
            verbose: true
        })
    ]
};
