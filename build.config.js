var fs = require('fs');
var pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
var license = fs.readFileSync('./LICENSE', 'utf8');

module.exports = {
	'banner': (
		'/**\n' +
		' * @license\n' +
		' * ' + license.replace(/\n/g, '\n * ') + '\n' +
		' */\n' +
		'\n' +
		'/*!\n' +
		' * @file ' + pkg.title + ': ' + pkg.description + '\n' +
		' * @author ' + pkg.author + '\n' +
		' * @version ' + pkg.version + '\n' +
		' */'
	).replace(/\t/g, ''),
	'wrapper': {
		'start': '(function (fn) { ' +
			'if (typeof define === \'function\' && define.amd) { ' +
				'define(\'just\', [], fn); ' +
			'} ' +
			'else if (typeof exports === \'object\' && Object(module).exports) {' +
				'exports.just = fn(); ' +
			'} ' +
			'else { ' +
				'this.just = fn(); ' +
			'} ' +
		'}).call(this, function () {',
		'end': 'return just; });'
	},
	'metadata': 'set(\'version\', \'' + pkg.version + '\');'
};
