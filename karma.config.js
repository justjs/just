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
		'browsers': ['Firefox'],
		'reporters': ['coverage', 'tap-pretty'],
		'preprocessors': {
			[browserBuild.getBuildSrc('test-tape')]: ['coverage']
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