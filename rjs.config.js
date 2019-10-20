var fs = require('fs');
var buildConfig = require('./build.config.js');

module.exports = {
	'skipModuleInsertion': true,
	'skipSemiColonInsertion': true,
	'wrap': {
		'start': (
			buildConfig.banner + '\n' +
			buildConfig.wrapper.start + '\n' +
			fs.readFileSync('./src/lib/core.js') +
			buildConfig.metadata + '\n'
		) + '\n',
		'end': buildConfig.wrapper.end
	},
	'onBuildWrite': function (moduleName, path, contents) {

		if (/index/.test(moduleName)) {
			return '';
		}

		return contents
			.replace(/require\(['"]\.\/([^\)]+)['"]\)/g, '$1')
			.replace(/var ([^\s]+) = \1;\n*/g, '')
			.replace(/module\.exports = ([^\s]+);/g, function ($0, $1) {
				return 'set(\'' + $1 + '\', ' + $1 + ');';
			})
			.trim();

	}
};
