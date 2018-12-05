var version = require('./package.json').version;
const path = require('path');
var pyname = 'ipyvolume'

// Custom webpack loaders are generally the same for all webpack bundles, hence
// stored in a separate local variable.
var rules = [
    { test: /\.css$/, use: ['style-loader', 'css-loader']},
    {test: /\.png$/,use: 'url-loader?limit=10000000'},
    // { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/},
    { test: /\.(ts|js)?$/, use: [
        //  { loader: 'cache-loader' },
        //  {
        //             loader: 'thread-loader',
        //             options: {
        //                 // there should be 1 cpu for the fork-ts-checker-webpack-plugin
        //                 workers: require('os').cpus().length - 1,
        //             },
        //  },
         { loader: "ts-loader", options: {transpileOnly: true,happyPackMode: true} }
        ]}
];

var resolve =  {
    extensions: ['.ts', '.js']
};



module.exports = (env, argv) => {
    let IS_PRODUCTION = argv.mode === 'production';
    let ON_RTD = process.env.READTHEDOCS == 'True';
    if (IS_PRODUCTION) {
        console.log('Looks like we are in production mode!');
    }
    if (ON_RTD) {
        // on RTD we need to be careful of memory usage
        console.log('Looks like we are on readthedocs');
    }
    // const devtool = IS_PRODUCTION ? undefined : 'inline-source-map',
    const devtool = IS_PRODUCTION ? 'cheap-eval-source-map' : 'source-map'
    if(ON_RTD) {
        devtool = undefined;
    }
    return [
        {// Notebook extension
        //
        // This bundle only contains the part of the JavaScript that is run on
        // load of the notebook. This section generally only performs
        // some configuration for requirejs, and provides the legacy
        // "load_ipython_extension" function which is required for any notebook
        // extension.
        //
            entry: './src/extension.js',
            devtool: devtool,
            output: {
                filename: 'extension.js',
                path: path.resolve(__dirname, `../${pyname}/static`),
                libraryTarget: 'amd'
            },
            resolve: resolve
        },
        {// Bundle for the notebook containing the custom widget views and models
        //
        // This bundle contains the implementation for the custom widget views and
        // custom widget.
        // It must be an amd module
        //
            entry: './src/index.js',
            devtool: devtool,
            output: {
                filename: 'index.js',
                path: path.resolve(__dirname, `../${pyname}/static`),
                libraryTarget: 'amd'
            },
            module: {
                rules: rules
            },
            externals: ['three', 'jupyter-js-widgets', '@jupyter-widgets/base', '@jupyter-widgets/controls'],
            resolve: resolve
        },
        {// Embeddable ipyvolume bundle
        //
        // This bundle is generally almost identical to the notebook bundle
        // containing the custom widget views and models.
        //
        // The only difference is in the configuration of the webpack public path
        // for the static assets.
        //
        // It will be automatically distributed by unpkg to work with the static
        // widget embedder.
        //
        // The target bundle is always `dist/index.js`, which is the path required
        // by the custom widget embedder.
        //
            entry: './src/embed.js',
            resolve: {
                extensions: ['.ts', '.js', '']
            },
            output: {
                filename: 'index.js',
                path: path.resolve(__dirname, './dist/'),
                libraryTarget: 'amd',
                publicPath: 'https://unpkg.com/ipyvolume@' + version + '/dist/'
            },
            devtool: IS_PRODUCTION ? 'cheap-source-map' : 'inline-source-map',
            module: {
                rules: rules
            },
            externals: ['jupyter-js-widgets', '@jupyter-widgets/base', '@jupyter-widgets/controls'],
            resolve: resolve
        },
        {
            entry: 'three',
            output: {
                filename: 'three.js',
                path: path.resolve(__dirname, `../${pyname}/static`),
                libraryTarget: 'amd'
            },
            module: {
                rules: rules
            }
        },
    ];
}
