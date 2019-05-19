module.exports = {
	'distributions': {
		'browser': {
			'main': './src/browser.js',
			'out': './dist/browser.js',
			'out-test': './test/tape/browser.test.js',
			'files': [
				'polyfills',
				'var/body',
				'var/DNT',
				'var/ELEMENT_NAMESPACES',
				'var/head',
				'var/html',
				'var/self',
				'access',
				'createPrivateKey',
				'defaults',
				'eachProperty',
				'getElements',
				'getFunctionName',
				'getPressedKey',
				'getRemoteParent',
				'hasOwn',
				'isEmptyObject',
				'isJSONLikeObject',
				'isKeyValueObject',
				'isTouchDevice',
				'isWindow',
				'loadElement',
				'parseUrl',
				'setDynamicKeys',
				'stringToJSON',
				'APRDefine',
				'APRLocalStorage'
			].map(file => './src/lib/' + file)
		},
		'server': {
			'main': './src/server.js',
			'out': './dist/server.js',
			'out-test': './test/tape/server.test.js',
			'files': [
				'access',
				'createPrivateKey',
				'defaults',
				'eachProperty',
				'hasOwn',
				'isEmptyObject',
				'isJSONLikeObject',
				'isKeyValueObject',
				'parseUrl',
				'stringToJSON'
			].map(file => './src/lib/' + file)
		}
	}
};