/* jshint node: true */
var path = require('path');
var webpack = require('webpack')

//var providers = new webpack.ProvidePlugin({
//    'React': 'react'
//})

module.exports = {
    context: path.join(__dirname),
    entry: './lib/index.js',

    output: {
        path: path.join(__dirname),
        filename: 'react-spoon.js',
        libraryTarget: 'umd',
        library: 'ReactSpoon'
    },

    module: {
        loaders: [
            {
                test: /\.scss$/,
                // Query parameters are passed to node-sass
                loader: 'style!css!sass?outputStyle=expanded&' +
                'includePaths[]=' + (path.resolve(__dirname, './bower_components')) + '&' +
                'includePaths[]=' + (path.resolve(__dirname, './node_modules'))
            },
            {
                test: /(\.js)|(\.jsx)$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    optional: ['runtime'],
                    stage: 0
                },
            }
        ]
    },
    devtool: "source-map",


};
