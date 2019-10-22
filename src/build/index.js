/**
 * @file Build script.
 */
var path = require('path');
var fs = require('fs');
var requirejs = require('requirejs');
var gzipSize = require('gzip-size');
var rjsConfig = require('./rjs.config.js');
var bytesToKb = function (bytes) { return bytes * 1e-3; };
var logSize = function (filepath, minFilepath) {

    var fileSizeKb = bytesToKb(fs.statSync(filepath).size).toFixed(3);
    var fileSizeGzipKb = bytesToKb(gzipSize.fileSync(filepath)).toFixed(3);
    var relativeFilepath = path.relative(process.cwd(), filepath);
    var minFileSizeKb = bytesToKb(fs.statSync(minFilepath).size).toFixed(3);
    var minFileSizeGzipKb = bytesToKb(gzipSize.fileSync(minFilepath)).toFixed(3);
    var minRelativeFilepath = path.relative(process.cwd(), minFilepath);

    console.log([
        '[SIZE] ',
        '| ',
        '| ' + relativeFilepath + ' -> ' + minRelativeFilepath,
        '| ',
        '| Base: ' + fileSizeKb + ' kb.',
        '| Gzipped: ' + fileSizeGzipKb + ' kb.',
        '| Minified: ' + minFileSizeKb + ' kb.',
        '| Minified & gzipped: ' + minFileSizeGzipKb + ' kb.',
        '| '
    ].join('\n'));

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

        requirejs.optimize(minFileConfig, function () {

            logSize(fileConfig.out, minFileConfig.out);

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
            logSize(out, out);

        }

    });

};

['browser', 'server'].forEach(function (build) {

    copyExtraFiles(build);
    bundle(build);

});
