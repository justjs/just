define('APRLocalStorage', [
	'./core',
	'./defaults',
	'./eachProperty',
], function (
	APR,
	defaults,
	eachProperty
) {

	'use strict';

	return APR.setModule('LocalStorage', /** @lends APR */
	/**
	 * A mixin of properties that access to some kind of storage
	 * in the browser.
	 *
	 * @param {boolean} [consent=false] A boolean indicating that
	 *     the user allowed the access to some kind of local storage.
	 *
	 * @param {boolean} [isExplicit=typeof consent !== 'undefined']
	 *
	 * @constructor
	 */
	function APRLocalStorage (consent, isExplicit) {
		
		if (!(this instanceof APRLocalStorage)) {
			return new APRLocalStorage(consent, isExplicit);
		}

		Object.defineProperties(this, {
			'consent': {
				'value': !!consent
			},
			'isExplicit': {
				'value': defaults(isExplicit, typeof consent !== 'undefined')
			}
		});

	}, /** @lends APR.LocalStorage */{
		/**
		 * @property {Function} cookieExists Checks if `cookie` is in `document.cookie`.
		 * @param {string} cookie The name of the cookie or the cookie itself.
		 * 
		 * @example
		 * document.cookie += 'a=b; c=d;';
		 * cookieExists('a'); // true
		 * cookieExists('b'); // false
		 * cookieExists('a=b'); // true
		 * cookieExists('a=d'); // false
		 *
		 * @return {boolean}
		 * @readOnly
		 */
		'cookieExists': {
			'value': function cookieExists (cookie) {
				return new RegExp('; ' + cookie + '(=|;)').test('; ' + document.cookie + ';');
			}
		},
		/**
		 * @property {function} getCookie Returns a cookie from `document.cookie`.
		 * @param {string} name The cookie name.
		 *
		 * @return {string|null} The cookie if it exists or null.
		 * @readOnly
		 */
		'getCookie': {
			'value': function getCookie (name) {
				return ('; ' + document.cookie).split('; ' + name + '=').pop().split('; ').shift().split(/^=/).pop() || null;
			}
		}
	}, /** @lends APR.LocalStorage.prototype */{
		/**
		 * @property {function} setCookie Concatenates a value to `document.cookie`.
		 *
		 * @param name The name of the cookie.
		 * @param value The value of the cookie.
		 * @param {!Object.<key, value>} [opts=setCookie~DEFAULT_OPTIONS]
		 * 
		 * @return {boolean} true if was set, false otherwise.
		 * @readOnly
		 */
		'setCookie': {
			'value': Object.defineProperties(function setCookie (name,
				value, opts) {
		
				var cookie = '';
				var set = function (k, v) {
					cookie += k + (typeof v !== 'undefined' ? '=' + v : '') + '; ';
				};
				var options = defaults(opts, setCookie.DEFAULT_OPTIONS);

				if (!this.consent) {
					return false;
				}

				set(name, value);

				if (options.secure) {
					set('secure');
				}
				
				delete options.secure;

				if (options.expires) {
					options.expires = new Date(options.expires).toGMTString();
				}

				eachProperty(options, function (v, k) {
					set(k, v);
				});

				document.cookie = cookie.trim();

				return true;

			}, {
				'DEFAULT_OPTIONS': {
					'get': function () {
						return {
							'secure': location.protocol === 'https:'
						};
					}
				}
			})
		},
		/**
		 * @property {function} removeCookie Overrides a cookie by
		 *     setting an empty value and expiring it.
		 *
		 * @param {string} name 
		 * @param {setCookie~DEFAULT_OPTIONS} [opts={'max-age': 0}]
		 *     Some extra options.
		 *
		 * @return {boolean} true if was overriden or the cookie
		 *     does not exist, false otherwise.
		 */
		'removeCookie': {
			'value': function removeCookie (name, opts) {
				
				var options = defaults(opts, {
					'expires': new Date(0)
				});

				if (!APR.LocalStorage.cookieExists(name)) {
					return true;
				}

				return this.setCookie(name, '', options);

			}
		},
		/**
		 * @property {function} isStorageAvailable Tests if the
		 *     specified storage does not throw.
		 *
		 * @param {string} type 
		 *
		 * @return {boolean} `true` if the function does not throw
		 *     and is allowed by the user, `false` otherwise.
		 */
		'isStorageAvailable': {
			'value': function isStorageAvailable (type) {
	
				var _ = '_';
				var storage;

				if (!this.consent) {
					return false;
				}

				if (/cookie/i.test(type)) {

					return this.setCookie(_, _) &&
						APR.LocalStorage.getCookie(_) === _ &&
						this.removeCookie(_);

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
		}
	});

});