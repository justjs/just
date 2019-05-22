'use strict';

const fs = require('fs');

const amdclean = require('amdclean'),
	gzip = require('gzip-js'),
	matchdep = require('matchdep');

const builds = require('./build/config');

const buildNames = Object.keys(builds);

module.exports = grunt => {

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
				'src': ['./build', '!./build/config.js']
			},
			'options': {
				'no-write': true
			}
		},
		'watch': {
			'src-copy': {
				'files': ['./src/**'],
				'tasks': ['copy']
			}
		},
		'connect': {
			'test': {
				'options': {
					'port': 8000,
					'directory': './test/server/public'
				}
			}
		},
		'requirejs': (() => {

			const mainOptions = {
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
				const target = 'bundle-dist-' + key;

				bundles[target] = {
					'options': {
						'baseUrl': './build',
						'include': build.files,
						'out': './build/dist/' + key + '.js'
					}
				};

			});

			return Object.assign({
				'options': mainOptions
			}, bundles);

		})(),
		'browserify': {
			'bundle-test-tape': {
				'options': {
					'transform': ['deamdify'],
				},
				'files': (() => {

					const files = {};

					buildNames.forEach(key => {

						const build = builds[key];
						const destiny = './build/test/tape/' + key + '.build.test.js';

						files[destiny] = build.files.map(file => {
							return './build/test/tape/' + file
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
			'options': {
				'pretty': true,
				'output': 'console'
			},
			'unit-server': {
				'src': ['./build/test/tape/*server.build.test.js']
			}
		},
		'testling': {
			'unit-browser': {
				'files': ['./build/test/tape/*browser.build.test.js']
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
				'cwd': './dist',
				'files': (() => {

					var files = {};

					buildNames.map(key => {
						files[key + '.min.js'] = [key + '.js'];
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
				'src': buildNames.map(key => './dist/' + key + '.js')
			}
		}
	});

	matchdep.filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	grunt.registerTask('init', [
		'clean:builds',
		'copy:build-src',
		'copy:build-test'
	]);
	grunt.registerTask('bundle', [].concat(buildNames.map(
		key => 'requirejs:bundle-dist-' + key
	), [
		'browserify:bundle-test-tape',
		'compare_size:build'
	]));
	grunt.registerTask('test', [
		'connect:test',
		'tape:unit-server',
		'testling:unit-browser'
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