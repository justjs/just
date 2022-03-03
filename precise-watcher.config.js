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
        'pattern': ['docs/static', 'docs/tmpl'],
        'on': ['change'],
        'run': [{
            'cmd': 'bin/document',
            'args': ['vx.x.x', '--run-jsdoc=false'],
        }]
    }, {
        // @TODO Merge this into the previous task.
        'pattern': ['src', 'bin', 'precise-watcher.config.js'],
        'on': ['ready', 'change'],
        'run': [{
            'cmd': 'bin/document',
            'args': ['vx.x.x', '--run-jsdoc=true']
        }]
    }]
};
