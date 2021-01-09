var liveServer = require('live-server');
var spawn = require('child_process').spawn;
var gulp = require('gulp');
var pkg = require('./package.json');
var Docs = function (cliArgs) {

    function document (done) {

        var cmd = spawn('./bin/document', cliArgs, {
            'cwd': __dirname
        });

        cmd.stdout.on('data', function (data) { console.log(data.toString()); });
        cmd.stderr.on('data', function (data) { console.error(data.toString()); });
        cmd.on('close', function (code) { done(); });

    }

    function serve (done) {

        liveServer.start({
            'root': 'docs/public',
            'ignore': ['docs/public/**/browser', 'docs/public/**/server', '**/*.temp']
        });

        done();

    }

    function stopServing (done) {

        liveServer.shutdown(); done();

    }

    function watch (done) {

        gulp.watch(['docs/static', 'docs/tmpl', 'bin'], {
            'ignoreInitial': false
        }, document);

    }

    return {
        'default': gulp.series(serve, document, stopServing),
        'watch': gulp.series(serve, watch, stopServing)
    };

};

exports.default = Docs(['v' + pkg.version, '--run-jsdoc=false']).default;
exports.jsdoc = Docs(['v' + pkg.version, '--run-jsdoc=true']).watch;
exports.check = Docs(['v' + pkg.version, '--run-jsdoc=true']).default;
