// Note: All files are relative to the Gruntfile location.
const fs = require('fs');

const amdclean = require('amdclean');

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8')),
	license = fs.readFileSync('./LICENSE', 'utf8');

const options = {
	// Banner for built files.
	'banner': (
   `/*!
	 * ${pkg.title} (${pkg.version}): ${pkg.description}
	 * Copyright (C) 2018, 2019 Alexis Puga Ruíz
	 *
	 *
	 * This program is free software: you can redistribute it and/or modify
	 * it under the terms of the GNU General Public License as published by
	 * the Free Software Foundation, either version 3 of the License, or
	 * (at your option) any later version.
	 *
	 * This program is distributed in the hope that it will be useful,
	 * but WITHOUT ANY WARRANTY; without even the implied warranty of
	 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	 * GNU General Public License for more details.
	 *
	 * You should have received a copy of the GNU General Public License
	 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
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
				buildKey + '.bundle.js',

			'compact': options.getPath('distribution') + '/' +
				buildKey + '.js',
			
			'minified': options.getPath('distribution') + '/' +
				buildKey + '.min.js'

		};

		return keys[key];

	},

	convertAMDModulesToCJS (path) {

		return amdclean.clean({

			'filePath': path,
			'aggressiveOptimizations': true,
			'wrap': {
				'start': ('\n' +
					'(function (fn) {\n' +
					"	if (typeof define === 'function' && define.amd) { define('APR', fn); }\n" +
					"	else if (typeof module === 'object' && module) { module.exports = fn(); }\n" +
					'	else { this.APR = fn(); }\n' +
					'}.call(this, function () {\n'
				),
				'end': '\n\treturn APR;\n}));'
			},
			'escodegen': {
				// Some comments still being removed
				// in version 2.7.0
				'comment': true,
				'removeAllRequires': true,
				'format': {
					'indent': {
						'base': 1,
						'style': '\t',
						'adjustMultilineComment': false
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

		'files': [
			'browser',
			'lib/var/DNT',
			'lib/var/elementNamespaces',
			'lib/access',
			'lib/check',
			'lib/defaults',
			'lib/eachProperty',
			'lib/findElements',
			'lib/getFunctionName',
			'lib/getPressedKey',
			'lib/getRemoteParent',
			'lib/inheritFrom',
			'lib/isEmptyObject',
			'lib/isTouchDevice',
			'lib/toObjectLiteral',
			'lib/isWindow',
			'lib/createPrivateKey',
			'lib/loadElement',
			'lib/parseUrl',
			'lib/stringToJSON',
			'lib/fill',
			'lib/flatten',
			'lib/flattenArray',
			'lib/flattenObjectLiteral',
			'lib/APRDefine',
			'lib/APRLocalStorage'
		].map(file => file.replace(/\.?\/?/, './src/') + '.js'),
		
		get polyfills () {
			return '\n' + fs.readFileSync('./src/lib/polyfills.js', 'utf8');
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

		'files': [
			'server',
			'lib/access',
			'lib/defaults',
			'lib/check',
			'lib/eachProperty',
			'lib/isEmptyObject',
			'lib/createPrivateKey',
			'lib/fill',
			'lib/flatten',
			'lib/flattenArray',
			'lib/flattenObjectLiteral',
			'lib/toObjectLiteral',
			'lib/stringToJSON'
		].map(file => file.replace(/\.?\/?/, './src/') + '.js'),
		
		get polyfills () {
			return '';
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