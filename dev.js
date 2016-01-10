var requireLink  = require('require-linked-peer')
var Base = require('./base')
var config = new Base()
module.exports = {
	devtool:  "cheap-source-map",
	output: {
		pathInfo: true
	},
	debug: true,
	devServer:  {
    	contentBase: './' + config.options.distPath,
    	hot: true
    }
}