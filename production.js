var requireLink  = require('require-linked-peer');
var webpack = requireLink('webpack');
var config = {};

config.plugins = [
	// short-circuits all warning code
	new webpack.DefinePlugin({
		"process.env": {
			"NODE_ENV": JSON.stringify("production")
		}
	}),
	new webpack.optimize.DedupePlugin(),
	// minify with dead-code elimination
	new webpack.optimize.UglifyJsPlugin({
		compress: {
			warnings: false
		},
		sourceMap: false
	}),
	// optimize module ids by occurence count
	new webpack.optimize.OccurenceOrderPlugin()
];

module.exports = config;