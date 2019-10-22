/**
 * @file Common configurations for the requirejs optimizer (r.js).
 */
var fs = require('fs');
var config = require('./config.js');
var removeCjsThings = function (contents) {

    return (contents + '')
        // Replace relative requires with vars: require('./x') -> x
        .replace(/require\(['"]\.\/([^)]+)['"]\)/g, '$1')
        // Remove same var assignment: var x = x;\n
        .replace(/var ([^\s]+) = \1;\n*/g, '')
        // Replace CJS export with `just` register.
        .replace(/module\.exports = ([^\s]+);/g, function ($0, $1) {

            return /^just$/.test($1) ? '' : 'set(\'' + $1 + '\', ' + $1 + ');';

        });

};

module.exports = {
    'skipModuleInsertion': true,
    'skipSemiColonInsertion': true,
    'wrap': {
        'start': [
            config.banner,
            config.wrapper.start,
            removeCjsThings(fs.readFileSync('./src/lib/core.js')).trim(),
            config.metadata
        ].join('\n') + '\n\n',
        'end': config.wrapper.end
    },
    'onBuildWrite': function (moduleName, path, contents) {

        if (/index/.test(moduleName)) { return ''; }

        return removeCjsThings(contents).trim() + '\n';

    }
};
