define('APRLocalStorage', [
	'./createPrivateKey',
	'./defaults',
	'./eachProperty',
], function (createPrivateKey, defaults, eachProperty) {

	'use strict';

	var _ = createPrivateKey();

	function APRLocalStorage (consent) {
		
		if (!(this instanceof APRLocalStorage)) {
			return new APRLocalStorage(consent);
		}

		_(this).consent = !!consent;

	}

	Object.assign(APRLocalStorage, {
		'cookieExists': function (cookie) {
			return new RegExp('; ' + cookie + '(=|;)').test('; ' + document.cookie + ';');
		},
		'getCookie': function (name) {
			return ('; ' + document.cookie).split('; ' + name + '=').pop().split('; ').shift().split(/^=/).pop();
		}
	});

	Object.assign(APRLocalStorage.prototype, {
		'setCookie': function (name, value, options, insecure) {
		
			var cookie = '', set = function (k, v) {
				cookie += k + (typeof v !== 'undefined' ? '=' + v : '') + '; ';
			};

			if (!_(this).consent) {
				return false;
			}

			options = defaults(options, {});

			set(name, value);

			if (!insecure) {
				set('secure');
			}

			if (options['max-age']) {
				options.expires = +new Date() + options['max-age'] * 1e3;
			}

			if (options.expires) {
				options.expires = new Date(options.expires).toGMTString();
			}

			eachProperty(options, function (v, k) {
				set(k, v);
			});

			document.cookie = cookie;

			return true;

		},
		'removeCookie': function (name, options) {
			
			if (!APRLocalStorage.cookieExists(name)) {
				return true;
			}

			return this.setCookie(name, '', Object.assign(defaults(options, {}), {
				'max-age': 0
			}));

		},
		'isStorageAvailable': function (type) {
	
			var _ = 'x';
			var storage;

			if (!_(this).consent) {
				return false;
			}

			try {
				storage = window[type];
				storage.setItem(_, _);
				storage.removeItem(_);
			}
			catch (exception) {
				return false;
			}
			
			return true;

		}
	});

	return APRLocalStorage;

});