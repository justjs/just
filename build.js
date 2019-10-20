var requirejs = require('requirejs');
var rjsConfig = require('./rjs.config.js');
var bundle = function (build) {

	requirejs.optimize(Object.assign({}, rjsConfig, {
		'name': build + '.index',
		'out': 'dist/' + build + '/just.js',
		'baseUrl': './src',
		'optimize': 'none'
	}), function () {
		requirejs.optimize(Object.assign({}, rjsConfig, {
			'baseUrl': './dist/' + build,
			'name': 'just',
			'out': './dist/' + build + '/just.min.js',
			'wrap': null
		}));
	});

};

['browser', 'server'].forEach(function (build) { bundle(build); });
