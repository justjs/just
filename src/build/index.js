/**
 * @file Build script.
 */
var path = require('path');
var fs = require('fs');
var requirejs = require('requirejs');
var gzipSize = require('gzip-size');
var UglifyJS = require('uglify-js');
var rjsConfig = require('./rjs.config.js');
var uglifyJsConfig = require('./uglifyjs.config.js');
var bytesToKb = function (bytes) { return bytes * 1e-3; };
var getFileSize = function (filepath, opts) {

    var options = Object.assign({
        'decimals': 3,
        'gzip': false
    }, opts);
    var decimals = options.decimals;
    var bytes = options.gzip ? gzipSize.fileSync(filepath) : fs.statSync(filepath).size;

    return {
        'b': bytes,
        'kb': +bytesToKb(bytes).toFixed(decimals)
    };

};
var logSize = function (filepath, minFilepath) {

    var fileSize = getFileSize(filepath);
    var minFileSize = getFileSize(minFilepath);
    var fileSizeGzip = getFileSize(filepath, {'gzip': true});
    var minFileSizeGzip = getFileSize(minFilepath, {'gzip': true});
    var relativeFilepath = path.relative(process.cwd(), filepath);
    var minRelativeFilepath = path.relative(process.cwd(), minFilepath);

    console.log([
        '[SIZE] ',
        '| ',
        '| ' + relativeFilepath + ' -> ' + minRelativeFilepath,
        '| ',
        '| Base: ' + fileSize.kb + ' kb.',
        '| Gzipped: ' + fileSizeGzip.kb + ' kb.',
        '| Minified: ' + minFileSize.kb + ' kb.',
        '| Minified & gzipped: ' + minFileSizeGzip.kb + ' kb.',
        '| '
    ].join('\n'));

};
var bundle = function concatenate (build) {

    var fileConfig = Object.assign({}, rjsConfig, {
        'name': 'index',
        'out': 'dist/' + build + '/just.js',
        'baseUrl': './src/' + build
    });

    requirejs.optimize(fileConfig, function minify () {

        fs.readFile(fileConfig.out, function (error, file) {

            var code = file + '';
            var result = UglifyJS.minify(code, uglifyJsConfig);
            var minFilepath = fileConfig.out.replace('.js', '.min.js');

            if (result.error) { throw error; }

            (result.warnings || []).forEach(
                function (warning) { console.log(warning); }
            );

            fs.writeFileSync(minFilepath, result.code, 'utf8');

            logSize(fileConfig.out, minFilepath);

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
