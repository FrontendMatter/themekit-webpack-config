module.exports = function () {
	return this.addLoaders([
		// hack to be able to require Modernizr v2.8.3
		// see https://github.com/webpack/webpack/issues/512
		{ test: /modernizr/, loader: "imports?this=>window!exports?window.Modernizr" },

		// Morris.js dependencies
		{ test: /raphael/, loader: "imports?fix=>module.exports=0!exports?window.Raphael" },
		{ test: /eve\.js$/, loader: "exports?window.eve" },

		// expose global jQuery
		{ test: /jquery\/dist\/jquery\.js$/, loader: 'expose?$!expose?jQuery' }
	])
	.webpack({
		module: {
			noParse: [
				// temporary fix for highlight.js + webpack issue
				// https://github.com/isagalaev/highlight.js/issues/895#issuecomment-149223858
				// also see https://github.com/webpack/webpack/issues/1721
				/autoit.js/
			]
		}
	})
}