var liveServer = require('live-server');
var spawn = require('child_process').spawn;
var gulp = require('gulp');
var pkg = require('./package.json');
var Docs = (function () {

    function document (done) {

        var cmd = spawn('./bin/document', ['v' + pkg.version], {
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

    return gulp.series(serve, watch, stopServing);

})();

exports.default = Docs;
