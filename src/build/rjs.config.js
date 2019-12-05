/**
 * @file Common configurations for the requirejs optimizer (r.js).
 */
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
    'optimize': 'none',
    'skipModuleInsertion': true,
    'skipSemiColonInsertion': true,
    'wrap': {
        'start': [
            config.banner,
            config.wrapper.start
        ].join('\n') + '\n',
        'end': [
            config.metadata,
            config.wrapper.end
        ].join('\n')
    },
    'onBuildWrite': function (moduleName, path, contents) {

        if (/just.* remove-from-(build|bundle)/i.test(contents)) { return ''; }

        return removeCjsThings(contents).trim() + '\n';

    }
};
