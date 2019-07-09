const tapSpec = require('tap-spec');

const builds = require('./build/config'),
	browserBuild = builds['browser'];

const buildOptions = builds['options'];

module.exports = config => {

	config.set({
		'autoWatch': false,
		'logLevel': config.LOG_DEBUG,
		'failOnEmptyTestSuite': false,
		'frameworks': ['tap'],
		'browsers': ['Firefox'],
		'reporters': ['coverage', 'tap-pretty'],
		'preprocessors': {
			'./src/lib/**/*.js': ['coverage']
		},
		'tapReporter': {
			'prettify': tapSpec,
			'separator': '****************************'
		},
		'coverageReporter': {
			'type': 'html',
			'dir': './coverage/'
		},
		'proxies': {
			'/assets/': '/base/' + buildOptions.publicDir.replace('./', '') + '/'
		},
		'files': [
			{
				'pattern': buildOptions.publicDir + '/*',
				'included': false,
				'served': true
			},
			browserBuild.polyfillsSrc,
			browserBuild.getBuildSrc('test-tape')
		].filter(v => v)
	});

};