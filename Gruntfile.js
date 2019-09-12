const fs = require('fs');

const gzip = require('gzip-js'),
	loadGruntTasks = require('load-grunt-tasks');

const builds = (file => {
		delete require.cache[file];
		return require(file);
	})('./build.config.js'),
	browserBuild = builds['browser'],
	serverBuild = builds['server'];

const buildOptions = builds['options'];

module.exports = grunt => {

	grunt.initConfig({
		
		// Remove previous builds.
		'clean': {
			...(pathKeys => {
			
				var paths = {};

				pathKeys.map(key => {
					const src = buildOptions.getPath(key) + '/*';
					paths[key] = {'src': [src]};
					return src;
				});

				return paths;

			})(Object.keys(buildOptions.getPath('*')))
		},

		// Copy code.
		'copy': {

			...((pathKeys, dest) => {

				var paths = {};

				paths.cwd = {
					'src': pathKeys.map(key => {
						const src = key + '/**';

						paths[key] = {
							'src': src,
							'dest': dest,
							'expand': true,
							'cwd': '.'
						};

						return src;
					}),
					'dest': dest,
					'expand': true,
					'cwd': '.'
				};

				return paths;

			})([
				'src', 'docs', 'distribution',
				'test', 'unit-test', 'integration-test'
			], buildOptions.getPath('build')),

			...(buildKeys => {

				var options = {};

				buildKeys.forEach(buildKey => {
					const tapePath = buildOptions.getPath('test-tape');
					const tapPath = buildOptions.getPath('test-tap');

					options[buildKey + '-tape-to-tap'] = {
						'cwd': tapePath,
						'src': buildOptions.getTestFiles(builds[buildKey].files.concat('integration'), tapePath)
							.map(file => file.replace(tapePath + '/', '')),
						'dest': tapPath,
						'expand': true,
						'options': {
							process (content, srcPath) {
								content = "require('amd-loader');\n" + content;
								return content.replace(/require\(("|')tape("|')\)/g,
									"require('tap').test");
							}
						}
					};
				});

				return options;

			})(['browser', 'server']),

			'dist-to-production': {
				'cwd': buildOptions.getPath('distribution'),
				'src': '**',
				'dest': buildOptions.getPath('production'),
				'expand': true
			}

		},

		// Bundle tests replacing amd modules with cjs ones.
		'browserify': {
			'unit-tests': {
				'options': {
					'transform': ['browserify-istanbul', 'deamdify', [
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
				'src': serverBuild.polyfillsSrc.concat(
					serverBuild.getBuildSrc('test-tape')
				)
			},
			'tap-unit': {
				'src': serverBuild.polyfillsSrc.concat(
					serverBuild.getTestFiles('test-tap')
				)
			}
		},

		// Test client code.
		'karma': {
			'unit': {
				'configFile': 'karma.config.js',
				'singleRun': true,
				'logLevel': 'INFO'
			},
			'unit-dev': {
				'configFile': 'karma.config.js',
				'browsers': ['Firefox'],
				'singleRun': false,
				'background': false
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
				'removeCombined': true,
				onBuildRead (moduleName, path, contents) {
					return buildOptions.replaceVars(contents);
				}
			},

			'browser-build': {
				'options': {
					'include': browserBuild.files,
					'out': browserBuild.getBuildSrc('compact'),
					onModuleBundleComplete (data) {
						browserBuild.replaceAMDModules(data.path);
					}
				}
			},

			'browser-bundle': {
				'options': {
					'include': browserBuild.files,
					'out': browserBuild.getBuildSrc('bundle'),
					'wrap': {
						'start': buildOptions.banner
					}
				}
			},

			'server-build': {
				'options': {
					'include': serverBuild.files,
					'out': serverBuild.getBuildSrc('compact'),
					onModuleBundleComplete (data) {
						serverBuild.replaceAMDModules(data.path);
					}
				}
			},

			'server-bundle': {
				'options': {
					'include': serverBuild.files,
					'out': serverBuild.getBuildSrc('bundle'),
					'wrap': {
						'start': buildOptions.banner
					}
				}
			}

		},

		// Minify distributions
		'uglify': {
			'options': {
				'mangle': true,
				'report': 'min',
				'output': {
					'ascii_only': true,
					comments (node, comment) {
						return /(^\*?\!|@(?:preserve|license))/g.test(comment.value);
					}
				}
			},
			'browser-build': {
				'files': {
					[browserBuild.getBuildSrc('minified')]: [
						browserBuild.getBuildSrc('compact')
					]
				}
			},
			'server-build': {
				'files': {
					[serverBuild.getBuildSrc('minified')]: [
						serverBuild.getBuildSrc('compact')
					]
				}
			}
		},

		'watch': {
			'options': {
				'atBegin': true
				/*'spawn': false,
				'interrupt': true*/
			},
			'all': {
				'files': ['./src/**', './test/**'],
				'tasks': ['build', 'test', 'document']
			},
			'jsdoc': {
				'files': ['./src/**'],
				'tasks': ['build', 'document']
			}
		},

		/* Generate documentation */
		'jsdoc': {
			'browser': {
				'src': [browserBuild.getBuildSrc('compact')],
				'dest': './docs/browser',
				'options': {
					'template': './node_modules/@alexispuga/jsdoc-template',
					'configure': './jsdoc.config.json'
				}
			},
			'server': {
				'src': [serverBuild.getBuildSrc('compact')],
				'dest': './docs/server',
				'options': {
					'template': './node_modules/@alexispuga/jsdoc-template',
					'configure': './jsdoc.config.json'
				}
			}
		},

		'connect': {
			'jsdoc': {
				'options': {
					'keepalive': true,
					'base': './docs'
				}
			}
		},

		'compare_size': {
			'production': {
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

		}

	});

	loadGruntTasks(grunt);

	grunt.registerTask('init', [
		'clean:build',
		'copy:src'
	]);

	grunt.registerTask('convert-tape-to-tap', [
		'copy:server-tape-to-tap',
		'copy:browser-tape-to-tap'
	]);

	grunt.registerTask('test:unit', [
		'clean:test',
		'copy:test',
		'copy:server-tape-to-tap',
		'browserify:unit-tests',
		'tape:tap-unit',
		'karma:unit'
	]);

	grunt.registerTask('test:unit-dev', [
		'clean:test',
		'copy:test',
		'copy:server-tape-to-tap',
		'browserify:unit-tests',
		'tape:tap-unit',
		'karma:unit-dev'
	]);

	grunt.registerTask('test:integration', [
		'clean:test',
		'copy:test',
		/** @TODO Implement tests */
	]);

	grunt.registerTask('test:integration-dev', [
		/** @TODO Implement tests */
	]);

	grunt.registerTask('test', [
		'test:unit',
		'test:integration'
	]);

	grunt.registerTask('test-dev', [
		'test:unit-dev',
		'test:integration-dev'
	]);

	grunt.registerTask('document', [
		'clean:docs',
		'copy:docs',
		'jsdoc'
	]);

	grunt.registerTask('build', [
		'clean:src',
		'copy:src',
		'requirejs',
		'uglify'
	]);

	grunt.registerTask('distribute', [
		'init',
		'test:unit',
		'build',
		'test:integration',
		'document',
		'clean:production',
		'copy:dist-to-production',
		'compare_size:production',
		'clean:build'
	]);

	grunt.registerTask('default', [
		'watch:all'
	]);

};
