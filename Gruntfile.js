var fs = require('fs'),
	amdclean = require('amdclean');

module.exports = function (grunt) {

	'use strict';

	grunt.initConfig({
		'pkg': grunt.file.readJSON('package.json'),
		'requirejs': (function () {

			var options = {
				'findNestedDependencies': true,
				'baseUrl': __dirname,
				'paths': {
					'@': 'src',
					'@lib': 'src/lib'
				},
				'optimize': 'none',
				'onModuleBundleComplete': function (data) {
					
					var output = data.path;

					fs.writeFileSync(output, amdclean.clean({
						'filePath': output,
						'IIFEVariableNameTransform': function (moduleName, moduleID) {

							var moduleKey = moduleID.replace(/^.+\//, '').replace(/\.js$/, '').replace(/^APR/, '');

							if (['polyfills', 'browser', 'server', ''].indexOf(moduleKey) >= 0) {
								return moduleName;
							}

							return 'APR[\'' + moduleKey + '\'] = ' + moduleName;

						}
					}));

				}

			};

			return {
				'browser': {
					'options': Object.assign({
						'include': [
							'src/browser',
							'src/lib/polyfills',
							'src/lib/access',
							'src/lib/APRDefine',
							'src/lib/APRLocalStorage',
							'src/lib/createPrivateKey',
							'src/lib/defaults',
							'src/lib/eachProperty',
							'src/lib/getElements',
							'src/lib/getFunctionName',
							'src/lib/getPressedKey',
							'src/lib/getRemoteParent',
							'src/lib/hasOwn',
							'src/lib/isEmptyObject',
							'src/lib/isJSONLikeObject',
							'src/lib/isKeyValueObject',
							'src/lib/isTouchDevice',
							'src/lib/isWindow',
							'src/lib/loadElement',
							'src/lib/parseUrl',
							'src/lib/setDynamicKeys',
							'src/lib/stringToJSON'
						],
						'out': 'dist/browser.js',
					}, options)
				},
				'server': {
					'options': Object.assign({
						'include': [
							'src/server.js',
							'src/lib/access',
							'src/lib/createPrivateKey',
							'src/lib/defaults',
							'src/lib/eachProperty',
							'src/lib/hasOwn',
							'src/lib/isEmptyObject',
							'src/lib/isJSONLikeObject',
							'src/lib/isKeyValueObject',
							'src/lib/parseUrl',
							'src/lib/stringToJSON'
						],
						'out': 'dist/server.js',
					}, options)
				}
			};

		})(),
		'uglify': (function () {

			var options = {
				'preserveComments': false,
				'mangle': false,
				'report': 'min',
				'output': {
					'ascii_only': true
				},
				'banner': '/*! <%= pkg.title %> - ' +
					'v<%= pkg.version %> - ' +
					'(c) <%= pkg.author %> and contributors */',
				'compress': {
					'hoist_funs': false,
					'loops': false
				}
			};

			return {
				'browser': {
					'files': {
						'dist/browser.min.js': 'dist/browser.js'
					},
					'options': Object.assign({}, options)
				},
				'server': {
					'files': {
						'dist/server.min.js': 'dist/server.js'
					},
					'options': Object.assign({}, options)
				}
			};

		})()
	});

	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.registerTask('build', ['requirejs']);
	grunt.registerTask('minify', ['uglify']);
	grunt.registerTask('default', [
		'build',
		'minify'
	]);

};