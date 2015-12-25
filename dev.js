var requireLink  = require('require-linked-peer');
var Config = requireLink('themekit-pipeline').config;
var configInst = new Config();
module.exports = {
	devtool:  "eval",
	output: {
		pathInfo: true
	},
	debug: true,
	devServer:  {
    	contentBase: './' + configInst.getBuildPath(),
    	hot: true
    }
}