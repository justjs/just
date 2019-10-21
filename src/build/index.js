/**
 * @file Build script.
 */
var fs = require('fs');
var requirejs = require('requirejs');
var rjsConfig = require('./rjs.config.js');
var bundle = function (build) {

    requirejs.optimize(Object.assign({}, rjsConfig, {
        'name': 'index',
        'out': 'dist/' + build + '/just.js',
        'baseUrl': './src/' + build,
        'optimize': 'none'
    }), function () {

        requirejs.optimize(Object.assign({}, rjsConfig, {
            'baseUrl': './dist/' + build,
            'name': 'just',
            'out': './dist/' + build + '/just.min.js',
            'wrap': null
        }));

    });

};
var copyExtraFiles = function (build) {

    var dir = './src/' + build;
    var outDir = './dist/' + build;

    ['polyfills.min.js'].forEach(function (filename) {

        var file = dir + '/' + filename;
        var out = outDir + '/' + filename;

        if (fs.existsSync(file)) {

            fs.mkdirSync(outDir, {'recursive': true});
            fs.copyFileSync(file, out);

        }

    });

};

['browser', 'server'].forEach(function (build) {

    copyExtraFiles(build);
    bundle(build);

});
