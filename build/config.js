module.exports = {
	'browser': {
		'files': ['./src/browser.js'].concat([
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
			'flatten',
			'APRDefine',
			'APRLocalStorage'
		].map(file => './src/lib/' + file + '.js'))
	},
	'server': {
		'files': ['./src/server.js'].concat([
			'access',
			'createPrivateKey',
			'defaults',
			'eachProperty',
			'hasOwn',
			'isEmptyObject',
			'isJSONLikeObject',
			'isKeyValueObject',
			'flatten',
			'stringToJSON'
		].map(file => './src/lib/' + file + '.js'))
	}
}