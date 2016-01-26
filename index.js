var util = require('util')
var path = require('path')
var WebpackConfig = require('webpack-config-api')

function ThemeKitWebpackConfig () {

	// super
	WebpackConfig.apply(this, Array.prototype.slice.call(arguments))

	this.addFileExtensions('js', 'scss', 'css')
		.addLoaders([
			{ test: /\.css$/, loader: 'style!css' },
			{ test: /\.scss$/, loader: 'style!css!sass!style-import?config=sassImportLoader' },
			{ test: /\.html$/, loader: 'html' }
		])
		.webpack({
			// inject ./src/sass/_common.scss at the beginning of imported .scss files
			sassImportLoader: {
				base: this.srcPath('sass', '_common.scss')
			}
		})

	////////////////
	// EXTENSIONS //
	////////////////

	const extensions = [
		'babel', 
		'bower', 
		'commons',
		'eslint',
		'extract',
		'fonts',
		'images'
	]

	try {
		extensions.forEach((e) => {
			this.register(e, require('webpack-config-api/extensions/' + e))
		})

		this.register('vendor', require('./extensions/vendor'))
			.register('vue', require('webpack-config-api/extensions/vue'), {
				loaders: {
					sass: 'style!css!sass!style-import?config=sassImportLoader'
				}
			})
	}
	catch (e) {
		console.warn('themekit-webpack-config: ' + e.message, e.stack)
	}

	this.use('babel')
		.use('eslint')
		.use('fonts')
		.use('images')
		.use('vue')
}

util.inherits(ThemeKitWebpackConfig, WebpackConfig)
module.exports = ThemeKitWebpackConfig