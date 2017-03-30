const path = require('path');
module.exports = {
    entry: './index.jsx',
    output: {
        path: path.resolve('dist'),
        filename: 'index.js'
    },
    module: {
        loaders: [
            {
                test: /\.jsx$/, loader: 'babel-loader', exclude: /node_modules/,
                query: {
                    presets: ['es2015', 'stage-2', 'react'],
                    plugins: ['transform-decorators-legacy', 'react-html-attrs', 'transform-class-properties']
                }
            }
        ]
    }
}