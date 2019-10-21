/**
 * @file Common configurations for the requirejs optimizer (r.js).
 */
var fs = require('fs');
var config = require('./config.js');

module.exports = {
    'skipModuleInsertion': true,
    'skipSemiColonInsertion': true,
    'wrap': {
        'start': (
            config.banner + '\n' +
            config.wrapper.start + '\n' +
            fs.readFileSync('./src/lib/core.js') +
            config.metadata + '\n'
        ) + '\n',
        'end': config.wrapper.end
    },
    'onBuildWrite': function (moduleName, path, contents) {

        if (/index/.test(moduleName)) { return ''; }

        return contents
            // Replace relative requires with vars: require('./x') -> x
            .replace(/require\(['"]\.\/([^)]+)['"]\)/g, '$1')
            // Remove same var assignment: var x = x;\n
            .replace(/var ([^\s]+) = \1;\n*/g, '')
            // Replace CJS export with `just` register.
            .replace(/module\.exports = ([^\s]+);/g, 'set(\'$1\', $1);')
            .trim();

    }
};
