APR.Define('APR/LocalStorage', 0.1).using(function () {
	
	'use strict';

	var _ = APR.createPrivateKey();

	function APRLocalStorage (consent) {
		
		if (!(this instanceof APRLocalStorage)) {
			return new APRLocalStorage(consent);
		}

		if (this.constructor === APRLocalStorage) {
			_(this).consent = !!consent;
		}

	}

	Object.assign(APRLocalStorage, {
		'version' : this.version
	});

	Object.assign(APRLocalStorage.prototype, {
		'setCookie' : (function () {

			function set (k, v) {
				cookie += k + (typeof v !== 'undefined' ? '=' + v : '') + '; ';
			}

			return function (name, value, options, insecure) {
		
				var cookie = '';

				if (!_(this).consent) {
					return false;
				}

				options = APR.defaults(options, {});

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

				APR.eachProperty(options, function (v, k) {
					set(k, v);
				});

				document.cookie = cookie;

				return true;

			};

		})(),
		'cookieExists' : function (cookie) {
			return new RegExp('; ' + cookie + '(=|;)').test('; ' + document.cookie + ';');
		},
		'getCookie' : function (name) {
			return ('; ' + document.cookie).split('; ' + name + '=').pop().split('; ').shift().split(/^=/).pop();
		},
		'removeCookie' : function (name, options) {
			return setCookie(name, '', Object.assign(APR.defaults(options, {}), {
				'expires' : 0
			}));
		},
		'isStorageAvailable' : function (type) {
	
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

	APRLocalStorage.Consent = (function () {

		var _ = APR.createPrivateKey();

		function APRLocalStorageConsent (validConsents) {

			if (!(this instanceof APRLocalStorageConsent)) {
				return new APRLocalStorageConsent(validConsents);
			}

			_(this).consents = validConsents;

			APRLocalStorage.call(this);

		}

		APRLocalStorageConsent.prototype = Object.assign(Object.create(APRLocalStorage.prototype), APRLocalStorageConsent.prototype, {

			'saveConsent' : function (name, value, maxAge) {

				this.setCookie(name, value, {
					'max-age' : typeof maxAge === 'number' ? maxAge : 3600 * 24 * 365,
					'path' : '/',
					'sameSite' : 'Strict'
				});

				return this;

			},
			'getSavedConsent' : function (name) {
				return _(this).consents[this.getCookie(name)];
			}

		});

		return APRLocalStorageConsent;

	})();

	if (!APR.LocalStorage) {
		APR.LocalStorage = APRLocalStorage;
	}

});