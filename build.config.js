// Note: All files are relative to the Gruntfile location.
const fs = require('fs');

const amdclean = require('amdclean');

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8')),
	license = fs.readFileSync('./LICENSE', 'utf8');

const options = {
	// Banner for built files.
	'banner': (
   `/**
	 * @license
	 * ${license.replace(/\n/g, '\n * ')}
	 */
	/*!
	 * @file ${pkg.title}: ${pkg.description}
	 * @author ${pkg.author}
	 * @version ${pkg.version}
	 */`).replace(/\t/g, ''),

	get publicDir () {
		return this.getPath('test-server') + '/public';
	},
	// Paths for the builds.
	getPath (key) {
		
		const path = './build';
		const pathTest = path + '/test';
		const paths = {
			'build': path,
			'src': path + '/src',
			'docs': path + '/docs',
			'distribution': path + '/dist',
			'test': pathTest,
			'test-tape': pathTest + '/tape',
			'test-tap': pathTest + '/tap',
			'test-server': pathTest + '/server',
			// Path for finished files.
			'production': './dist'
		};

		// Returns everything.
		if (key === '*') {
			return paths;
		}

		return (key ? paths[key] : path);

	},
	// Handler for replacements of variables during the build.
	replaceVars (code) {

		// Data for variables.
		const vars = {
			'CORE_VERSION': pkg.version,
			getModuleNote (moduleID) {
				return "<aside class='note'><p>To use this module, see {@link " +
					moduleID + "}.</p></aside>";
			}
		};

		/* Matches any of the following:
		 // %{key}%
		 // %{getKey}["a", "b"]%
		 %{key}%
		 %{getKey}["a", "b"]%
		*/
		const regexp = /(?:\/\/(.+))?\%\{(.+)\}(\[.+\])?\%/g;

		// Replaces `regexp` with
		// vars[key] if vars[key] exists,
		// vars[key].apply(null, args) if args is a JSON-STRINGIFIED Array,
		// or with an empty string otherwise.
		const handler = ($0, content, key, args) => {
			const value = vars[key];

			return (key in vars
				? (content || '') + (args
					? value.apply(null, JSON.parse(args))
					: value
				)
				: ''
			);
		};

		return code.replace(regexp, handler);

	},
	// Modifies a filename to match the test one.
	getTestFilename (filename, type) {

		// Renames:
		// ./someModule.js -> ./someModule.build.test.js
		if (type === 'build') {
			return filename + '.build.test.js';
		}

		// Renames: ./src/lib/someModule.js -> {
		//     build -> lib-someModule.build.test.js
		//     default -> lib-someModule.test.js
		// }
		return filename
			.replace(/\.?\/?src\//, '')
			.replace(/\//g, '-')
			.replace(/(\.js|$)/, '.test.js');
	
	},

	getTestFiles (files, path) {

		return files.map(file => {
			return path + '/' + options.getTestFilename(file)
		});

	},

	getBuildSrc (buildKey, key) {

		const keys = {
			
			'test-tape': options.getPath('test-tape') + '/' +
				options.getTestFilename(buildKey, 'build'),
			
			'bundle': options.getPath('distribution') + '/' +
				buildKey + '/just.bundle.js',

			'compact': options.getPath('distribution') + '/' +
				buildKey + '/just.js',
			
			'minified': options.getPath('distribution') + '/' +
				buildKey + '/just.min.js'

		};

		return keys[key];

	},

	convertAMDModulesToCJS (path) {

		return amdclean.clean({

			'filePath': path,
			'aggressiveOptimizations': true,
			'wrap': {
				'start': '(function(fn){if(typeof define==="function"&&define.amd)define("just",[],fn);else if(typeof exports==="object"&&Object(module).exports){module.exports=fn()}else{this.just=fn()}}).call(this,function(){\n' +
					'/* eslint-disable no-unused-vars */\n',
				'end': '\n\treturn just;\n});'
			},
			'escodegen': {
				// Some comments still being removed
				// in version 2.7.0
				'comment': true,
				'removeAllRequires': true,
				'format': {
					'indent': {
						'base': 1,
						'style': '    ',
						'adjustMultilineComment': true
					}
				}
			},
			// Removes the path and the extension
			// from all the variables.
			// src/lib/someModule_js -> someModule
			prefixTransform (postNormalizedModuleName, preNormalizedModuleName) {
				return preNormalizedModuleName.replace(/^.*\//, '').replace(/\.js$/, '');
			}

		});

	}

};

module.exports = {
	'options': options,
	'browser': {
		/** @type {!Array} */
		'polyfillsSrc': ['./src/lib/polyfills.js'],
		'files': [
			'browser',
			'lib/access',
			'lib/check',
			'lib/defaults',
			'lib/eachProperty',
			'lib/findElements',
			'lib/getPressedKey',
			'lib/getRemoteParent',
			'lib/isEmptyObject',
			'lib/isTouchDevice',
			'lib/toObjectLiteral',
			'lib/isWindow',
			'lib/defineProperty',
			'lib/defineProperties',
			'lib/loadElement',
			'lib/parseUrl',
			'lib/on',
			'lib/stringToJSON',
			'lib/fill',
			'lib/flatten',
			'lib/flattenArray',
			'lib/flattenObjectLiteral',
			'lib/Define',
			'lib/LocalStorage',
			'lib/ClassList'
		].map(file => file.replace(/\.?\/?/, './src/') + '.js'),
		/** @type {string} */
		get polyfills () {
			return this.polyfillsSrc.map(src => {
				return '\n' + fs.readFileSync(src, 'utf8');
			}).join('');
		},
		getBuildSrc (key) {
			return options.getBuildSrc('browser', key);
		},
		getTestFiles (pathKey) {
			return options.getTestFiles(
				this.files,
				(pathKey ? options.getPath(pathKey) : '.')
			);
		},
		replaceAMDModules (path) {
			fs.writeFileSync(path,
				options.banner +
				this.polyfills +
				options.convertAMDModulesToCJS(path)
			);
		}

	},
	'server': {
		/** @type {!Array} */
		'polyfillsSrc': [],
		'files': [
			'server',
			'lib/access',
			'lib/defaults',
			'lib/check',
			'lib/eachProperty',
			'lib/isEmptyObject',
			'lib/defineProperty',
			'lib/defineProperties',
			'lib/fill',
			'lib/flatten',
			'lib/flattenArray',
			'lib/flattenObjectLiteral',
			'lib/toObjectLiteral',
			'lib/stringToJSON'
		].map(file => file.replace(/\.?\/?/, './src/') + '.js'),
		/** @type {string} */
		get polyfills () {
			return this.polyfillsSrc.map(src => {
				return '\n' + fs.readFileSync(src, 'utf8');
			}).join('');
		},
		getBuildSrc (key) {
			return options.getBuildSrc('server', key);
		},
		getTestFiles (pathKey) {
			return options.getTestFiles(this.files,
				options.getPath(pathKey));
		},
		replaceAMDModules (path) {
			fs.writeFileSync(path,
				options.banner +
				this.polyfills +
				options.convertAMDModulesToCJS(path)
			);
		}

	}
}