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
        ' * @preserve Copyright 2019 ' + pkg.author + '.\n' +
        ' * @file ' + pkg.title + ': ' + pkg.description + '\n' +
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
        '}).call(this, function () { ' +
        ('\n' + fs.readFileSync('src/lib/shims.min.js', 'utf8')).replace(/\n/g, '\n\t'),
        'end': 'return just; });'
    },
    'metadata': 'set(\'version\', \'' + pkg.version + '\');'
};
