var requireLink  = require('require-linked-peer')
var base = require('./base')
module.exports = {
	devtool:  "eval",
	output: {
		pathInfo: true
	},
	debug: true,
	devServer:  {
    	contentBase: './' + base.options.distPath,
    	hot: true
    }
}