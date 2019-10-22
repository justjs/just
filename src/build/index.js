/**
 * @file Build script.
 */
var fs = require('fs');
var requirejs = require('requirejs');
var gzipSize = require('gzip-size');
var rjsConfig = require('./rjs.config.js');
var bytesToKb = function (bytes) { return bytes * 1e-3; };
var logSize = function (filepath) {

    var fileSizeKb = bytesToKb(fs.statSync(filepath).size);
    var fileSizeGzipKb = bytesToKb(gzipSize.fileSync(filepath));

    console.log(filepath + ' | ' + fileSizeKb + ' kb. -> ' + fileSizeGzipKb + ' kb.');

};
var bundle = function concatenate (build) {

    var fileConfig = Object.assign({}, rjsConfig, {
        'name': 'index',
        'out': 'dist/' + build + '/just.js',
        'baseUrl': './src/' + build,
        'optimize': 'none'
    });

    requirejs.optimize(fileConfig, function minify () {

        var minFileConfig = Object.assign({}, rjsConfig, {
            'baseUrl': './dist/' + build,
            'name': 'just',
            'out': './dist/' + build + '/just.min.js',
            'wrap': null,
            'uglify': {
                'warnings': true,
                'mangle': true,
                'toplevel': true,
                'typeofs': false
            }
        });

        logSize(fileConfig.out);

        requirejs.optimize(minFileConfig, function () {

            logSize(minFileConfig.out);

        });

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
