// const path = require('path');
const webpack = require('webpack');

module.exports = {
    mode: 'development',
    resolve: {
        fallback: {
            // url: require.resolve('url'),
            // crypto: require.resolve('crypto-browserify'),
            // http: require.resolve('stream-http'),
            // https: require.resolve('https-browserify'),
            // os: require.resolve('os-browserify/browser'),
            // fs: require.resolve('fs'),
            process: require.resolve('process'),
            assert: require.resolve('assert'),
            stream: require.resolve('stream-browserify'),
            Buffer: require.resolve('buffer'),
        },
    },
    plugins: [
        // Work around for Buffer is undefined:
        // https://github.com/webpack/changelog-v5/issues/10
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        }),
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
    ],
}