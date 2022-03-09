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
        'run': [{
            'cmd': 'node',
            'args': ['src/build']
        }, {
            'cmd': 'npm',
            'args': 'run style dist'.split(' ')
        }, {
            'cmd': 'bin/document',
            'args': ['vx.x.x', '--run-jsdoc=true']
        }]
    }, {
        // @TODO Merge this with the previous tasks.
        'pattern': ['bin', 'precise-watcher.config.js', 'docs/static/versioned', 'docs/jsdoc.config.js'],
        'on': ['ready', 'change'],
        'run': [{
            'cmd': 'bin/document',
            'args': ['vx.x.x', '--run-jsdoc=true']
        }]
    }]
};
