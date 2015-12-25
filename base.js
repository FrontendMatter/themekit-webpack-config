var requireLink  = require('require-linked-peer');
var path = require('path');
var webpack = requireLink('webpack');
var ExtractTextPlugin = requireLink('extract-text-webpack-plugin');
var qs = require('webpack-query-string');

var Config = requireLink('themekit-pipeline').config;
var configInst = new Config();

var resolve = require('resolve');
function resolveLink(path) {
	return resolve.sync(path, { basedir: process.cwd() });
}

var config = {
	entry: {},
	resolve: {
		// require modules from bower_components
		root: [ path.join(process.cwd(), 'bower_components') ],
		// fixes issues with linked npm packages
		fallback: [ path.join(process.cwd(), 'node_modules') ],
		// add support to require modules without an extension
		// the empty '' must be included to require modules with an extension
		extensions: [ '', '.js', '.vue', '.less', '.css' ]
	},
	resolveLoader: {
		// fixes issues with linked npm packages
		fallback: [ path.join(process.cwd(), 'node_modules') ],
		// add support to require modules without an extension
		// the empty '' must be included to require modules with an extension
		extensions: [ '', '.js', '.vue', '.less', '.css' ]
	},
	output: {
		path: path.join(process.cwd(), configInst.getBuildPath('build')),
		// when not running webpack-dev-server, we set a relative publicPath
		// used in conjunction with ExtractTextPlugin publicPath option below
		publicPath: ! configInst.getConfig().webpackDevServer ? 'build/' : '/build/',
		filename: "[name].js"
	},
	module: {
		loaders: [
			// ExtractTextPlugin publicPath option overwrites the config.output.publicPath above
			// this has to be used when config.output.publicPath above is a relative path i.e. "build/"
			{ test: /\.css$/, loader: ExtractTextPlugin.extract('style', 'css', { publicPath: "" }) },
			{ test: /\.less$/, loader: ExtractTextPlugin.extract('style', 'css!less!less-import', { publicPath: "" }) },
			{ test: /\.html$/, loader: 'html' },
			{ test: /\.vue$/, loader: 'vue' },

			// fonts
			{ test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/font-woff' },
			{ test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/octet-stream' },
			{ test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file' },
			{ test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=image/svg+xml' },

			// images
			{
				test: /\.(png|jpg)$/, 
				loader: 'url', 
				query: {
					// limit for base64 inlining in bytes
					limit: 10000,
					// custom naming format if file is larger
					// than the threshold
					name: '[name].[ext]?[hash]'
				} 
			},

			// hack to be able to require isotope-layout via webpack
			// see http://isotope.metafizzy.co/appendix.html#webpack
			{ test: /isotope\-|fizzy\-ui\-utils|desandro\-|masonry|packery|outlayer|get\-size|doc\-ready|eventie|eventemitter/, loader: 'imports?define=>false&this=>window' },

			// hack to be able to require Modernizr v2.8.3 installed using bower
			// see https://github.com/webpack/webpack/issues/512
			{ test: /modernizr/, loader: "imports?this=>window!exports?window.Modernizr" },

			// use babel-loader for *.js files
			// with ESLint
			{
				test: /\.js$/,
				loader: 'babel!eslint',
				// use 'include' when possible
				// otherwise exclude files in node_modules and bower_components
				// exclude: /node_modules|bower_components/,
				include: [
					// files in ./src
					path.resolve(process.cwd(), configInst.getSrcPath()),
					// files from the themekit-vue package
					/themekit\-vue/
				]
			}
		]
	},
	vue: {
		loaders: {
			css: 'style!css',
			less: 'style!css!less!less-import',
			// important!
			// use vue-html-loader instead of html-loader
			// with .vue files
			html: 'vue-html?' + qs({
				// configure the loader to process the src="./image" attribute
				// for custom elements, other than the default img
				attrs: [
					'img:src', 
					'cover-banner:src', 
					'cover-link:src', 
					'cover-overlay:src'
				]
			}),
			// Linting JavaScript in .vue files
			js: 'babel!eslint'
		}
	},
	// These are the default babel-loader options
	// but require.resolve is needed to fix issues with linked npm modules
	// See https://github.com/babel/babel-loader/issues/166
	babel: {
		presets: [ resolveLink('babel-preset-es2015') ],
		plugins: [ resolveLink('babel-plugin-transform-runtime') ]
	},
	eslint: {
		configFile: path.resolve(__dirname, '.eslintrc')
	},
	// inject ./src/less/common.less at the beginning of required .less files
	lessImportLoader: {
		base: path.resolve(process.cwd(), configInst.getSrcPath('less', 'common.less'))
	},
	plugins: [
		// make a module available in every module
		// the module is required only if the variable is actually used
		new webpack.ProvidePlugin({
			$: "jquery",
			jQuery: "jquery",
			"window.jQuery": "jquery"
		}),
		// require modules from bower_components
		new webpack.ResolverPlugin(
			new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin("bower.json", ["main"])
		),
		// extract all the processed CSS into a separate file
		new ExtractTextPlugin('[name].css'),
		// create common chunk
		new webpack.optimize.CommonsChunkPlugin('common', 'common.js')
	]
};

module.exports = config;