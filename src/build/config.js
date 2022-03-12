/**
 * @file Common configurations for builds.
 */
var fs = require('fs');
var pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
var license = fs.readFileSync('./LICENSE', 'utf8');
var projectUrl = pkg.repository.url.replace(/\.git$/, '');
var currentYear = new Date().getUTCFullYear();

module.exports = {
    'banner': (
        '/**\n' +
        ' * @license\n' +
        ' * ' + license.replace(/\n/g, '\n * ') + '\n' +
        ' */\n' +
        '\n' +
        '/**\n' +
        ' * @preserve © 2019-' + currentYear + ' {@link ' + pkg.author.url + '|' + pkg.author.name + '} and {@link ' + projectUrl + '/contributors|contributors}. {@link ' + projectUrl + '|' + pkg.title + '} is released under the {@link ' + projectUrl + '/blob/master/LICENSE|' + pkg.license + ' License}.\n' +
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
        '}).call(this, function () { "use strict";\n',
        'end': 'return just; });'
    },
    'metadata': 'set(\'version\', \'' + pkg.version + '\'); set(\'just\', just);'
};
