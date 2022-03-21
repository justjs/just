var env = process.env;
var TAG = env.VERSION_TAG || 'v' + env.npm_package_version;
var SERVER_DIR = 'docs/public';
var GIT_STATIC_REPOSITORY = env.GIT_STATIC_REPOSITORY || 'https://github.com/justjs/justjs.github.io.git';
var GIT_STATIC_DESTINATION = SERVER_DIR;
var production = env.NODE_ENV === 'production';
var development = !production;

module.exports = {
    'src': [{
        'pattern': SERVER_DIR,
        'on': (development ? ['ready'] : null),
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
            'cmd': 'rm',
            'args': [SERVER_DIR + '/.git', '-R']
        }, {
            // Replace all versions (in old versions) once.
            'cmd': 'node',
            'args': ['bin/replace-versions.js', 'docs/public/*/']
        }].concat(development ? [{
            'cmd': 'rm',
            'args': [SERVER_DIR + '/index.html'] // Avoid showing latest version on start up.
        }, {
            'cmd': 'live-server',
            'args': [SERVER_DIR],
        }] : [])
    }].concat((development ? {
        // @TODO Merge this with similar tasks.
        'pattern': ['docs/static/non-versioned'],
        'on': ['change'],
        'run': [{
            'cmd': 'bin/document',
            'args': [TAG, '--run-jsdoc=false'],
        }]
    } : []), {
        // @TODO Merge this with similar tasks.
        'pattern': ['src'],
        'on': (development ? ['ready', 'change'] : null),
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
                'args': [TAG, '--run-jsdoc=true'],
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
    }, (development ? {
        // @TODO Merge this with similar tasks.
        'pattern': ['bin', 'precise-watcher.config.js', 'docs/static/versioned', 'docs/jsdoc.config.js'],
        'on': ['change'],
        'run': [{
            'cmd': 'bin/document',
            'args': [TAG, '--run-jsdoc=true']
        }]
    } : []))
};
