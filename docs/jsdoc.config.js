var nunjucksConfig = require('../nunjucks.config.js');
var nunjucks = nunjucksConfig.render.context;
var availableVersions = [nunjucks.version].concat(nunjucks.getAvailableVersions()).reduce(function (unique, v) {

    if (unique.indexOf(v) > -1) { return unique; }

    return unique.concat(v);

}, []);
var availableBundles = {
    'server': 'server',
    'browser': 'browser (full)'
};
var version = nunjucks.version;

module.exports = {
	'opts': {
        'template': '../node_modules/@alexispuga/jsdoc-template',
        'recurse': true
	},
    'templates': {
    	'custom': {
    		'siteName': 'JustJs',
    		'tags': {
    			'head': [
                    '<meta name=\'description\' content=\'Documentation for the version ' + version + ' of JustJs.\'/>',
                    '<link rel=\'preload\' href=\'/font/spacemono/SpaceMono-Regular.ttf\' as=\'font\' />',
                    '<link rel=\'apple\-touch-icon\' sizes=\'180x180\' href=\'/img/apple-touch-icon.png?v=1.2.0\'/>',
                    '<link rel=\'icon\' type=\'image/png\' sizes=\'32x32\' href=\'/img/favicon-32x32.png?v=1.2.0\'/>',
                    '<link rel=\'icon\' type=\'image/png\' sizes=\'16x16\' href=\'/img/favicon-16x16.png?v=1.2.0\'/>',
                    '<link rel=\'manifest\' href=\'/img/site.webmanifest?v=1.2.0\'/>',
                    '<link rel=\'mask\-icon\' href=\'/img/safari-pinned-tab.svg?v=1.2.0\' color=\'#641a5b\'/>',
                    '<link rel=\'shortcut\ icon\' href=\'/img/favicon.ico?v=1.2.0\'/>',
                    '<meta name=\'msapplication\-TileColor\' content=\'#641a5b\'/>',
                    '<meta name=\'msapplication\-TileImage\' content=\'/img/mstile-144x144.png?v=1.2.0\'/>',
                    '<meta name=\'msapplication\-config\' content=\'/img/browserconfig.xml?v=1.2.0\'/>',
                    '<meta name=\'theme\-color\' content=\'#641a5b\'/>',
    				'<link rel="stylesheet" href="/v' + version +  '/css/jsdoc.css"/>'
    			],
    			'header': [
    				'<div id="logo"><a href="/" title="JustJs"><img src="/img/logo-white-64x64.png?v=1.2.0" alt="JustJs" srcset="/img/logo-white-128x128.png?v=1.2.0 2x"/></a></div>',
                    '<div class="wrapper">',
                    '<select id="bundles">' + Object.keys(availableBundles).map(function (k) { return '<option value="' + k + '"' + (k === 'browser' ? ' selected' : '') + '>' + availableBundles[k] + '</option>'; }).join('') + '</select>',
                    '<select id="versions">' + availableVersions.map(function (v) { return '<option value="' + v + '"' + (v === version ? ' selected' : '') + '>' + v + '</option>'; }).join('') + '</select>',
                    '</div>'
    			],
                'footer': [
                    '<script src="/v' + version + '/js/index.js" defer></script>'
                ]
    		}
    	}
    }
};
