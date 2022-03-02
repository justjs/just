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
		'on': ['ready', 'change'],
		'run': [{
			'cmd': 'bin/document',
			'args': ['vx.x.x', '--run-jsdoc=false'],
		}]
	}]
};
