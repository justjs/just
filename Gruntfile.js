'use strict';

const fs = require('fs');
const amdclean = require('amdclean'),
	gzip = require('gzip-js');
const {distributions} = require('./config');
const {'browser': distBrowser, 'server': distServer} = distributions;
const {
	'out': distBrowserOut,
	'out-test': distBrowserOutTest,
	'main': distBrowserMain,
	'files': distBrowserFiles
} = distBrowser;
const {
	'out': distServerOut,
	'out-test': distServerOutTest,
	'main': distServerMain,
	'files': distServerFiles
} = distServer;

module.exports = grunt => {

	grunt.initConfig({
		'pkg': grunt.file.readJSON('package.json'),
		'connect': {
			'test': {
				'options': {
					'port': 8000,
					'directory': './test/server/public'
				}
			}
		},
		'requirejs': (() => {

			const options = {
				'findNestedDependencies': true,
				'baseUrl': __dirname,
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
							const reservedKeys = Object.keys(distributions).concat(['polyfills', 'core', '']);

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

			return {
				'dist-browser': {
					'options': Object.assign({}, options, {
						'include': [distBrowserMain].concat(distBrowserFiles),
						'out': distBrowserOut
					})
				},
				'dist-server': {
					'options': Object.assign({}, options, {
						'include': [distServerMain].concat(distServerFiles),
						'out': distServerOut
					})
				}
			};

		})(),
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
			'dist-browser': {
				'files': {
					[distBrowserOut.replace(/(\.js)?$/, '.min.js')]: distBrowserOut
				}
			},
			'dist-server': {
				'files': {
					[distServerOut.replace(/(\.js)?$/, '.min.js')]: distServerOut
				}
			}
		},
		'browserify': (() => {

			const replaceFilename = filename => {
				return './test/tape/' + filename
					.replace(/\.?\/?src\/?/g, '')
					.replace(/\//g, '-')
					.replace(/(\.js|$)/, '.test.js');
			};

			return {
				'bundle-tape-browser': {
					'files': {
						[distBrowserOutTest]: distBrowserFiles.map(
							filename => replaceFilename(filename)
						)
					}
				},
				'bundle-tape-server': {
					'files': {
						[distServerOutTest]: distServerFiles.map(
							filename => replaceFilename(filename)
						)
					}
				}
			};

		})(),
		'tape': {
			'options': {
				'pretty': true,
				'output': 'console'
			},
			'unit-server': {
				'src': (/\/tape\//.test(distServerOutTest)
					? [distServerOutTest]
					: []
				)
			}
		},
		'testling': {
			'unit-browser': {
				'src': (/\/tape\//.test(distBrowserOutTest)
					? [distBrowserOutTest]
					: []
				)
			}
		},
		'watch': {
			'files': [],
			'tasks': []
		},
		'compare_size': {
			'options': {
				'cache': './dist/.sizecache.json',
				'compress': {
					gz (fileContents) {
						return gzip.zip(fileContents, {}).length;
					}
				}
			},
			'dist-browser': {
				'src': ['./dist/**.js']
			}
		}
	});

	grunt.loadNpmTasks('grunt-compare-size');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-testling');
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-tape');

	grunt.registerTask('build', ['requirejs', 'browserify']);
	grunt.registerTask('minify', ['uglify']);
	grunt.registerTask('test', ['connect:test', 'testling:unit-browser', 'tape:unit-server']);

	grunt.registerTask('default', [
		'build',
		'minify',
		'compare_size',
		'test'
	]);

};