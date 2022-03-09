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
var distributedFiles = [
    'browser/core.js',
    'server/index.js',
    'browser/just.js'
];
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
var minify = function uglify (filename, out) {

    fs.readFile(filename, function (error, file) {

        var code = file + '';
        var result = UglifyJS.minify(code, uglifyJsConfig);

        if (!out) { out = filename.replace('.js', '.min.js'); }
        if (result.error) { throw error; }

        (result.warnings || []).forEach(
            function (warning) { console.log(warning); }
        );

        fs.writeFileSync(out, result.code, 'utf8');

        logSize(filename, out);

    });

};
var bundle = function concatenate (directory, filename) {

    var fileConfig = Object.assign({}, rjsConfig, {
        'name': filename.replace(/\.js$/i, ''),
        'out': path.join('./dist', directory, filename),
        'baseUrl': path.join('./src', directory)
    });

    requirejs.optimize(fileConfig, function () { minify(fileConfig.out); });

};
var copyExtraFiles = function (baseDirectory, files, opts) {

    var options = Object.assign({
        'minify': false
    }, opts);
    var directory = path.join('./src/', baseDirectory);
    var outDirectory = path.join('./dist/', baseDirectory);

    files.forEach(function (filepath) {

        var filename = path.basename(filepath);
        var file = path.join(directory, filepath);
        var out = path.join(outDirectory, filename);

        if (fs.existsSync(file)) {

            fs.mkdirSync(outDirectory, {'recursive': true});
            fs.copyFileSync(file, out);

            if (options.minify) { minify(out, out); }

        }

    });

};

distributedFiles.forEach(function (filepathRelativeToSrc) {

    var filename = ((filepathRelativeToSrc.match(/\/([^/]*)$/) || [])[1] || 'index').replace(/(?:\.js)?$/, '.js');
    var directory = path.dirname(filepathRelativeToSrc);
    var filepath = path.resolve(path.join('src/', filepathRelativeToSrc).replace(/(?:\.js)?$/, '.js'));
    var out = path.join('dist/', directory, filename);
    var tempFilepath;

    if (/browser/i.test(filepath)) {

        copyExtraFiles(directory, ['polyfills-es5.min.js'], {'minify': true});
        bundle(directory, filename);

    }
    else if (/server/i.test(filepath)) {

        tempFilepath = filepath.replace('index', 'exports.temp');

        fs.writeFileSync(
            tempFilepath,
            (fs.readFileSync(filepath) + '')
                .replace(/[^,{]+:\s*require\(([^)]+)\)/g,
                    function ($0, quotedSrc) { return quotedSrc.replace(/(['"])(?:\.js)?$/, '.js$1'); }
                )
                .replace(/= \{/, '= [')
                .replace(/\n?\};/, '];'),
            'utf8'
        );

        copyExtraFiles(directory, require(tempFilepath));
        try { fs.unlinkSync(tempFilepath); }
        catch (notFound) { /* ignore */ }
        copyExtraFiles(directory, [filename]);

        fs.writeFileSync(out, (fs.readFileSync(out) + '').replace(/\.{2}\/lib\//g, './'), 'utf8');

    }

});
