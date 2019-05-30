'use strict';

const fs = require('fs');

const amdclean = require('amdclean'),
	gzip = require('gzip-js'),
	loadGruntTasks = require('load-grunt-tasks');

const builds = require('./build/config');

const buildNames = Object.keys(builds);

module.exports = grunt => {

	loadGruntTasks(grunt);

	grunt.initConfig({
		'pkg': grunt.file.readJSON('package.json'),
		'copy': {
			'build-src': {
				'cwd': './src',
				'src': ['**'],
				'dest': './build/src',
				'expand': true
			},
			'build-test': {
				'cwd': './test',
				'src': ['**'],
				'dest': './build/test',
				'expand': true
			},
			'dist': {
				'cwd': './build/dist',
				'src': ['**'],
				'dest': './dist',
				'expand': true
			}
		},
		'clean': {
			'builds': {
				'src': ['./build/*', '!./build/config.js']
			}
		},
		'watch': {
			'src-copy': {
				'files': ['./src/**'],
				'tasks': ['copy']
			}
		},
		'requirejs': (() => {

			const distOptions = {
				'findNestedDependencies': true,
				'optimize': 'none',
				onModuleBundleComplete (data) {
					
					const {'path': output} = data;

					fs.writeFileSync(output, amdclean.clean({
						'filePath': output,
						'globalModules': ['APR'],
						prefixTransform (postNormalizedModuleName, preNormalizedModuleName) {
							return preNormalizedModuleName.replace(/^.*\//, '').replace(/\.js$/, '');
						},
						IIFEVariableNameTransform (moduleName, moduleID) {

							const moduleKey = moduleID.replace(/^.*\//, '').replace(/\.js$/, '').replace(/^APR/, '');
							const reservedKeys = buildNames.concat(['polyfills', 'core', '']);

							if (/^APR/.test(moduleName) && /\//.test(moduleID)) {
								return moduleName;
							}

							if (reservedKeys.indexOf(moduleKey) >= 0) {
								return moduleName;
							}

							return 'APR[\'' + moduleKey + '\'] = ' + moduleName;

						}
					}));

				}

			};
			var bundles = {};

			buildNames.forEach(key => {
					
				const build = builds[key];
				const {files} = build;

				bundles['bundle-dist-' + key] = {
					'options': Object.assign({
						'baseUrl': './build',
						'include': files,
						'out': './build/dist/' + key + '.js'
					}, distOptions)
				};

			});

			return bundles;

		})(),
		'browserify': {
			// Convert the amd modules into `require`s,
			// and bundle them into one single file.
			'bundle-test-tape': {
				'options': {
					'transform': ['deamdify']
				},
				'files': (() => {

					var files = {};

					buildNames.forEach(key => {

						const build = builds[key];
						const path = './build/test/tape/';
						const destiny = path + key + '.build.test.js';

						files[destiny] = build.files.map(file => {
							return path + file
								.replace(/\.?\/?src\//, '')
								.replace(/\//g, '-')
								.replace(/(\.js|$)/, '.test.js');
						});

					});

					return files;

				})()
			}
		},
		'tape': {
			// TAP won't work with amd modules. Files need
			// to be converted first in order to be tested. 
			'unit-server': {
				'options': {
					'pretty': true,
					'output': 'console'
				},
				'src': ['./build/test/tape/*server.build.test.js']
			}
		},
		'karma': {
			'unit-browser': {
				'frameworks': ['tape'],
				'files': [
					{'src': "/build/test/server/public/*", 'included': false, 'served': true},
					{'src': 'build/test/tape/*browser.build.test.js'}
				],
				'preprocessors': {
					'./build/src/lib/**/*.js': 'coverage'
				},
				'browsers': ['jsdom'],
				'singleRun': false,
				'reporters': ['progress', 'coverage'],
				'proxies': {
					'/assets/': '/build/test/server/public/'
				}
			}
		},
		'uglify': {
			'options': {
				'preserveComments': false,
				'report': 'min',
				'output': {
					'ascii_only': true
				},
				'banner': '/*! <%= pkg.title %> - v<%= pkg.version %> - ' +
					'(c) <%= pkg.author %> and contributors */',
				'compress': {
					'hoist_funs': false,
					'loops': false
				}
			},
			'dist': {
				'files': (() => {

					var files = {};

					buildNames.map(key => {
						files['./dist/' + key + '.min.js'] = ['./build/dist/' + key + '.js'];
					});

					return files;

				})()
			}
		},
		'compare_size': {
			'options': {
				'compress': {
					gz (fileContents) {
						return gzip.zip(fileContents, {}).length;
					}
				}
			},
			'build': {
				'options': {
					'cache': './build/.sizecache.json'
				},
				'src': buildNames.map(key => './build/dist/' + key + '.js')
			},
			'dist': {
				'options': {
					'cache': './dist/.sizecache.json'
				},
				'src': ['./dist/*.js']
			}
		}
	});

	grunt.registerTask('init', [
		'clean:builds',
		'copy:build-src',
		'copy:build-test'
	]);
	grunt.registerTask('bundle', [
		'requirejs',
		'browserify',
		'compare_size:build'
	]);
	grunt.registerTask('test', [
		'tape:unit-server',
		'karma:unit-browser'
	]);
	grunt.registerTask('distribute', [
		'copy:dist',
		'uglify:dist',
		'compare_size:dist'
	]);

	grunt.registerTask('default', [
		'init',
		'bundle',
		'test',
		'distribute',
		'watch'
	]);

};