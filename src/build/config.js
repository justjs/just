/**
 * @file Common configurations for builds.
 */
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
        '/**\n' +
        ' * @preserve Copyright 2019-2020 ' + pkg.author.name + ' and contributors. See {@link ' + pkg.repository.url.replace(/\.git$/, '') + '/contributors}.\n' +
        ' * @file ' + pkg.title + ': ' + pkg.description + '\n' +
        ' * @version ' + pkg.version + '\n' +
        ' */'
    ).replace(/\t/g, ''),
    'wrapper': {
        'start': '(function (fn) { ' +
            'if (typeof define === \'function\' && define.amd) { ' +
                'define(\'just\', [], fn); ' +
            '} ' +
            'else if (typeof module === \'object\' && module.exports) {' +
                'module.exports = fn(); ' +
            '} ' +
            'else { ' +
                'this.just = fn(); ' +
            '} ' +
        '}).call(this, function () { ',
        'end': 'return just; });'
    },
    'metadata': 'set(\'version\', \'' + pkg.version + '\'); set(\'just\', just);'
};
