var extendify = require('extendify');
var forOwn = require('mout/object/forOwn');
var extend = extendify({
	arrays: 'concat'
});
module.exports = function (options) {
	var args = Array.prototype.slice.call(arguments);
	var config = extend.apply(extend, args);

	// temporary fix for https://github.com/bigShai/extendify/issues/4
	if (typeof config.entry !== 'undefined') {
		forOwn(config.entry, function (value, key, o) {
			if (Array.isArray(value)) {
				config.entry[key] = value.filter(function (v) {
					return typeof v !== 'undefined'
				});
			}
		})
	}

	return config;
}