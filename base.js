var requireLink  = require('require-linked-peer')
var path = require('path')
var webpack = requireLink('webpack')
var ExtractTextPlugin = requireLink('extract-text-webpack-plugin')
var qs = require('webpack-query-string')
var merge = require('mout/object/merge')
var keys = require('mout/object/keys')

var resolve = require('resolve')
function resolveLink(path) {
	return resolve.sync(path, { basedir: process.cwd() })
}

// requiring module __dirname
var dirname = path.dirname(module.parent.filename)

// loader: extension
var styleLoadersMap = {
	'css': 'css',
	'less': 'less',
	'sass': 'scss'
}

function base () {
	this.options = {
		distPath: 'dist',
		srcPath: 'src',
		outputPath: 'build',
		publicPath: true,
		bower_components: true,
		plugins: {
			ExtractTextPlugin: true,
			CommonsChunkPlugin: true
		},
		plugin: {
			ExtractTextPlugin: {
				publicPath: ''
			},
			ProvidePlugin: {}
		},
		loader: {
			babel: {
				include: [],
				exclude: []
			}
		}
	}
	this.loadOptions()
	this.config = {
		entry: {},
		resolve: {
			// fixes issues with linked npm packages
			fallback: [ path.join(process.cwd(), 'node_modules') ],
			// add support to require modules without an extension
			// the empty '' must be included to require modules with an extension
			extensions: [ '', '.js', '.vue', '.less', '.scss', '.css' ]
		},
		resolveLoader: {
			// fixes issues with linked npm packages
			fallback: [ path.join(process.cwd(), 'node_modules') ],
			// add support to require modules without an extension
			// the empty '' must be included to require modules with an extension
			extensions: [ '', '.js', '.vue', '.less', '.scss','.css' ]
		},
		output: {
			filename: "[name].js"
		},
		module: {
			noParse: [
				// temporary fix for highlight.js + webpack issue
				// https://github.com/isagalaev/highlight.js/issues/895#issuecomment-149223858
				// also see https://github.com/webpack/webpack/issues/1721
				/autoit.js/
			],
			loaders: [
				// ExtractTextPlugin publicPath option overwrites the config.output.publicPath above
				// this has to be used when config.output.publicPath above is a relative path i.e. "build/"
				{ test: /\.css$/, loader: 'style!css' },
				{ test: /\.less$/, loader: 'style!css!less!style-import?config=lessImportLoader' },
				{ test: /\.scss$/, loader: 'style!css!sass!style-import' },
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
					exclude: this.options.loader.babel.exclude,
					include: [
						// files in ./src
						path.resolve(process.cwd(), this.options.srcPath)
					].concat(this.options.loader.babel.include)
				},

				{ test: resolveLink('jquery'), loader: 'expose?$!expose?jQuery' },
			]
		},
		vue: {
			loaders: {
				css: 'style!css',
				less: 'style!css!less!style-import?config=lessImportLoader',
				sass: 'style!css!sass!style-import',
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
		// inject ./src/sass/_common.scss at the beginning of imported .scss files
		styleImportLoader: {
			base: this.srcPath('sass', '_common.scss')
		},
		plugins: [
			// make a module available in every module
			// the module is required only if the variable is actually used
			new webpack.ProvidePlugin(this.options.plugin.ProvidePlugin)
		]
	}
}

base.prototype.srcPath = function () {
	var paths = Array.prototype.slice.call(arguments, 0)
	paths.unshift(this.options.srcPath)
	return path.resolve(process.cwd(), path.join.apply(path, paths))
}

// load user options
base.prototype.loadOptions = function () {
	var fs = require('fs')
	var configPath = path.resolve(dirname, 'base.config.js')
	if (fs.existsSync(configPath)) {
		this.applyOptions(require(configPath))
	}
}

// apply options
base.prototype.applyOptions = function (options) {
	this.options = merge(this.options, options)
}

// webpack config
base.prototype.getConfig = function () {
	// require modules from bower_components
	if (this.options.bower_components) {
		this.config.resolve.root = [ 
			path.join(process.cwd(), 'bower_components') 
		]
		this.config.plugins.push(
			new webpack.ResolverPlugin(
				new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin("bower.json", ["main"])
			)
		)
	}
	// output path
	var outputPath = [this.options.distPath]
	if (this.options.outputPath) {
		outputPath.push(this.options.outputPath)
	}
	this.config.output.path = path.join(process.cwd(), path.join.apply(path, outputPath));
	// relative publicPath
	if (this.options.publicPath) {
		this.config.output.publicPath = this.options.outputPath + '/' 
	}
	// create common chunk
	if (this.options.plugins.CommonsChunkPlugin) {
		this.config.plugins.push(
			new webpack.optimize.CommonsChunkPlugin('common', 'common.js')
		)
	}
	// extract all the processed CSS into a separate file
	if (this.options.plugins.ExtractTextPlugin) {
		this.config.plugins.push(
			new ExtractTextPlugin('[name].css')
		)
		keys(styleLoadersMap).forEach(function (loaderName) {
			var vueLoaders = this.config.vue.loaders[loaderName].split('!')
			this.config.vue.loaders[loaderName] = ExtractTextPlugin.extract(
				vueLoaders.shift(), 
				vueLoaders.join('!'), 
				this.options.plugin.ExtractTextPlugin
			)
			var extension = styleLoadersMap[loaderName]
			var test = new RegExp("\\." + extension + "$")
			var loader = this.getLoader(test)
			if (loader) {
				var styleLoaders = loader.loader.loader.split('!')
				loader.loader.loader = ExtractTextPlugin.extract(
					styleLoaders.shift(), 
					styleLoaders.join('!'), 
					this.options.plugin.ExtractTextPlugin
				)
				this.config.module.loaders[loader.index] = loader.loader
			}
		}, this)
	}
	return this.config
}

// utility to remove plugin from config
// i.e. plugin === webpack.optimize.CommonsChunkPlugin
base.prototype.removePlugin = function (plugin) {
	this.config.plugins = this.config.plugins.filter(function (p) {
		return p instanceof plugin === false
	})
}

// i.e. test === /\.js$/
base.prototype.getLoader = function (test) {
	var loaders = this.config.module.loaders.map(function(loader, index) {
		return {
			loader: loader,
			index: index
		}
	})
	var loader = loaders.filter(function (loader) {
		return String(loader.loader.test) === String(test)
	})
	return loader.length ? loader[0] : false
}

// utility to remove a loader from config
// i.e. test === /\.js$/
base.prototype.removeLoader = function (test) {
	var loader = this.getLoader(test)
	if (loader) {
		this.config.module.loaders.splice(loader.index, 1)
	}
}

module.exports = new base()