const fs = require('fs');

const gzip = require('gzip-js'),
	loadGruntTasks = require('load-grunt-tasks');

const builds = require('./build/config'),
	browserBuild = builds['browser'],
	serverBuild = builds['server'];

const buildOptions = builds['options'];

module.exports = grunt => {

	grunt.initConfig({

		// Remove previous builds.
		'clean': {
			'builds': {
				'src': [
					buildOptions.getPath('build') + '/*',
					'!' + buildOptions.getPath('build') + '/config.js'
				]
			}
		},

		// Copy code.
		'copy': {
			'all': {
				'cwd': '.',
				'src': ['./src/**', './test/**'],
				'dest': buildOptions.getPath('build'),
				'expand': true
			}
		},

		// Bundle tests replacing amd modules with cjs ones.
		'browserify': {
			'tests': {
				'options': {
					'transform': ['deamdify', [
						// Fixes karma error 0 of 0 by using
						// the karma-framework instead of a new
						// import.
                    	'browserify-replace', {
							'replace': [{
								'from': /require\((\"|\')tape(\"|\')\)/g,
								'to': 'typeof tape !== "undefined" ? tape : require("tape")'
							}]
						}
					]]
				},
				'files': {
					[browserBuild.getBuildSrc('test-tape')]:
						browserBuild.getTestFiles('test-tape'),
					[serverBuild.getBuildSrc('test-tape')]:
						serverBuild.getTestFiles('test-tape')
				}
			}
		},

		// Test server code.
		'tape': {
			'options': {
				'pretty': true,
				'output': 'console'
			},
			'unit': {
				'src': [
					serverBuild.polyfills,
					serverBuild.getBuildSrc('test-tape')
				].filter(v => v)
			}
		},

		// Test client code.
		'karma': {
			'unit': {
				'configFile': 'karma.conf.js',
				'browsers': ['jsdom'],
				'singleRun': true,
				'logLevel': 'INFO'
			},
			'unit-dev': {
				'configFile': 'karma.conf.js',
				'singleRun': false,
				'background': true
			}
		},

		// Build distributions
		'requirejs': {

			'options': {
				'optimize': 'none',
				'baseUrl': buildOptions.getPath('build'),
				'findNestedDependencies': true,
				'skipModuleInsertion': true,
				'skipSemiColonInsertion': true,
				onBuildRead (moduleName, path, contents) {
					return buildOptions.replaceVars(contents);
				}
			},

			'browser-build': {
				'options': {
					'include': browserBuild.files,
					'out': browserBuild.getBuildSrc('distribution'),
					onModuleBundleComplete (data) {
						browserBuild.replaceAMDModules(data.path);
					}
				}
			},

			'server-build': {
				'options': {
					'include': serverBuild.files,
					'out': serverBuild.getBuildSrc('distribution'),
					onModuleBundleComplete (data) {
						serverBuild.replaceAMDModules(data.path);
					}
				}
			}

		},

		// Minify distributions
		'uglify': {
			'options': {
				'mangle': true,
				'report': 'min',
				'banner': buildOptions.banner,
				'preserveComments': false,
				'output': {
					'ascii_only': true
				}
			},
			'browser-build': {
				'files': {
					[browserBuild.getBuildSrc('distribution-minified')]: [
						browserBuild.getBuildSrc('distribution')
					]
				}
			},
			'server-build': {
				'files': {
					[serverBuild.getBuildSrc('distribution-minified')]: [
						serverBuild.getBuildSrc('distribution')
					]
				}
			}
		},

		'compare_size': {
			'distributions': {
				'options': {
					'cache': buildOptions.getPath('production') + '/.sizecache.json',
					'compress': {
						gz (fileContents) {
							return gzip.zip(fileContents, {}).length;
						}
					}
				},
				'src': [buildOptions.getPath('production') + '/**']
			}
		
		},

		'watch': {
			'options': {
				/*'spawn': false,
				'interrupt': true*/
			},
			'all': {
				'files': ['./src/**', './test/**'],
				'tasks': ['init', 'browserify:tests']
			},
			'browserify': {
				'files': [
					buildOptions.getBuildSrc('browser', 'test-tape'),
					buildOptions.getBuildSrc('server', 'test-tape')
				],
				'tasks': [
					'karma:unit-dev:run',
					'tape:unit'
				]
			}
		},

	});

	loadGruntTasks(grunt);

	grunt.registerTask('init', [
		'clean:builds',
		'copy:all'
	]);

	grunt.registerTask('test', [
		'browserify:tests',
		'karma:unit',
		'tape:unit'
	]);

	grunt.registerTask('distribute', [
		'requirejs',
		'uglify',
		'compare_size'
	]);

	grunt.registerTask('default', [
		'init',
		'test'
	]);

	grunt.registerTask('build', [
		'default',
		'distribute'
	]);

	grunt.registerTask('development', [
		'watch'
	]);

};