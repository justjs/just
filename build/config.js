// Note: All files are relative to the Gruntfile location.

const pkg = require('../package.json');

const options = {
	// Banner for build files.
	'banner': '/*! ' + pkg.title + ' v' + pkg.version +
	' - (c) ' + pkg.author + '.' +
	' - license: ' + pkg.license +
	' */\n',
	// Paths for the builds.
	getPath (key) {
		
		const path = './build';
		const pathTest = path + '/test';
		const paths = {
			'base': path,
			'src': path + '/src',
			'test': pathTest,
			'test-tap': pathTest + '/tap',
			'test-tape': pathTest + '/tape',
			'test-server': pathTest + '/server',
			'mutableProduction': path + '/dist',
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
			'CORE_VERSION': pkg.version
		};

		// Matches: // content %{key}%.
		const regexp = /\/\/(.+)\%\{(.+)\}\%/g;

		// Replaces `regexp` with vars[key] if vars[key] exists,
		// otherwise it replaces `regexp` with an empty string.
		const handler = ($0, content, key) => {
			return (key in vars
				? content + vars[key]
				: ''
			);
		};

		return code.replace(regexp, handler);

	},
	// Modifies a filename to match the unit-test one.
	getUnitTestFilename (filename, type) {

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
	
	}

};

module.exports = {
	'options': options,
	'browser': {
		'files': [
			'./src/lib/polyfills.js',
			'./src/browser.js'
		].concat([
			'var/DNT',
			'var/ELEMENT_NAMESPACES',
			'var/self',
			'access',
			'check',
			'defaults',
			'eachProperty',
			'getElements',
			'getFunctionName',
			'getPressedKey',
			'getRemoteParent',
			'inheritFrom',
			'isEmptyObject',
			'isTouchDevice',
			'toKeyValueObject',
			'isWindow',
			'loadElement',
			'parseUrl',
			'stringToJSON',
			'fill',
			'flatten',
			'flattenArray',
			'flattenKeyValueObject',
			'APRDefine',
			'APRLocalStorage'
		].map(file => './src/lib/' + file + '.js'))
	},
	'server': {
		'files': ['./src/server.js'].concat([
			'access',
			'defaults',
			'check',
			'eachProperty',
			'isEmptyObject',
			'fill',
			'flatten',
			'flattenArray',
			'flattenKeyValueObject',
			'toKeyValueObject',
			'stringToJSON'
		].map(file => './src/lib/' + file + '.js'))
	}
}