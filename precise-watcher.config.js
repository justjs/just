var SERVER_DIR = 'docs/public';

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
            'cmd': 'live-server',
            'args': [SERVER_DIR],
        }]
    }, {
        'pattern': ['docs/static/non-versioned'],
        'on': ['change'],
        'run': [{
            'cmd': 'bin/document',
            'args': ['vx.x.x', '--run-jsdoc=false'],
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
                'args': ['vx.x.x', '--run-jsdoc=true'],
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
            'args': ['vx.x.x', '--run-jsdoc=true']
        }]
    }]
};
