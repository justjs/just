const path = require('path');

const tapSpec = require('tap-spec');

const builds = (file => {
		delete require.cache[file];
		return require(file);
	})('./build.config.js'),
	browserBuild = builds['browser'];

const buildOptions = builds['options'];

module.exports = config => {

	config.set({
		'autoWatch': false,
		'logLevel': config.LOG_DEBUG,
		'failOnEmptyTestSuite': false,
		'frameworks': ['tap'],
		'browsers': ['jsdom'],
		'reporters': ['coverage-istanbul', 'tap-pretty'],
		'tapReporter': {
			'prettify': tapSpec,
			'separator': '****************************'
		},
		'coverageIstanbulReporter': {
			'reports': ['html', 'text', 'text-summary'],
			'dir': path.join(__dirname, 'coverage/%browser%'),
		},
		'proxies': {
			'/assets/': '/base/' + buildOptions.publicDir.replace('./', '') + '/'
		},
		'files': browserBuild.polyfillsSrc.concat([
			{
				'pattern': buildOptions.publicDir + '/*',
				'included': false,
				'served': true
			},
			browserBuild.getBuildSrc('test-tape')
		])
	});

};