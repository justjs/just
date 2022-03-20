var env = process.env;
var npmPackageVersion = env.npm_package_version;
var DEVELOPMENT_TAG = 'v' + npmPackageVersion;
var SERVER_DIR = 'docs/public';
var GIT_STATIC_REPOSITORY = env.GIT_STATIC_REPOSITORY || 'https://github.com/justjs/justjs.github.io.git';
var GIT_STATIC_DESTINATION = SERVER_DIR;

module.exports = {
    'src': [{
        'pattern': SERVER_DIR,
        'on': 'ready',
        'run': [{
            'cmd': 'rm',
            'args': [SERVER_DIR, '-R']
        }, {
            'cmd': 'mkdir',
            'args': [SERVER_DIR]
        }, {
            'cmd': 'git',
            'args': ['clone', GIT_STATIC_REPOSITORY, GIT_STATIC_DESTINATION, '--depth=1']
        }, {
            // Replace all versions (old/new versions) once during development.
            'cmd': 'node',
            'args': ['bin/replace-versions.js', 'docs/public/*/']
        }, {
            'cmd': 'rm',
            'args': [SERVER_DIR + '/index.html'] // Avoid showing latest version on start up.
        }, {
            'cmd': 'live-server',
            'args': [SERVER_DIR],
        }]
    }, {
        'pattern': ['docs/static/non-versioned'],
        'on': ['change'],
        'run': [{
            'cmd': 'bin/document',
            'args': [DEVELOPMENT_TAG, '--run-jsdoc=false'],
        }]
    }, {
        'pattern': ['src'],
        'on': ['ready', 'change'],
        'run': (function () {

            var running = false;

            return [{
                'cmd': 'node',
                'args': ['src/build'],
                'beforeRun': function () {

                    if (running) { return false; }

                    running = true;

                    return running;

                }
            }, {
                'cmd': 'npm',
                'args': 'run style dist'.split(' '),
                'beforeRun': function () { return running; }
            }, {
                'cmd': 'bin/document',
                'args': [DEVELOPMENT_TAG, '--run-jsdoc=true'],
                'beforeRun': function () { return running; }
            }, {
                'cmd': 'echo',
                'args': ['Removing lock...'],
                'beforeRun': function () {

                    running = false;

                    return true;

                }
            }];

        })()
    }, {
        // @TODO Merge this with the previous tasks.
        'pattern': ['bin', 'precise-watcher.config.js', 'docs/static/versioned', 'docs/jsdoc.config.js'],
        'on': ['change'],
        'run': [{
            'cmd': 'bin/document',
            'args': [DEVELOPMENT_TAG, '--run-jsdoc=true']
        }]
    }]
};
