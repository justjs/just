var version = process.env.npm_package_version;

module.exports = {
	'opts': {
        'template': '../node_modules/@alexispuga/jsdoc-template',
        'recurse': true
	},
    'templates': {
    	'custom': {
    		'siteName': 'Just js',
    		'tags': {
    			'head': [
                    '<link rel="shortcut icon" type="image/png" href="/img/favicon-16x16.png?v=1.2.0"/>',
    				'<link rel="stylesheet" href="../css/jsdoc.css?v=' + version + '"/>'
    			],
    			'header': [
    				'<div id="logo"><a href="/" title="JustJS"><img src="/img/logo-white-64x64.png?v=1.2.0" alt="JustJS" srcset="/img/logo-white-128x128.png?v=1.2.0 2x"/></a></div>'
    			]
    		}
    	}
    }
};
