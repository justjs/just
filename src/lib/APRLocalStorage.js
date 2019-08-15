define([
	'./core',
	'./defaults',
	'./eachProperty',
], function (
	APR,
	defaults,
	eachProperty
) {

	'use strict';

	/**
	 * A mixin of properties that access to some kind of storage
	 * in the browser.
	 *
	 * @class
	 * @memberof APR
	 * @param {boolean} [consent=false] - A boolean indicating that
	 *     the user allowed the access to some kind of local storage.
	 * @param {boolean} [isExplicit=typeof consent !== 'undefined'] -
	 *     A value to indicate if the given consent was specified by the
	 *     user.
	 */
	var LocalStorage = function APRLocalStorage (consent, isExplicit) {
		
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

	};

	Object.defineProperties(LocalStorage, /** @lends APR.LocalStorage */{
		/**
		 * Checks if `cookie` is in `document.cookie`.
		 *
		 * @function
		 * @static
		 * @param {string} cookie - The name of the cookie or the cookie itself.
		 * 
		 * @example
		 * document.cookie += 'a=b; c=d;';
		 * cookieExists('a'); // true
		 * cookieExists('b'); // false
		 * cookieExists('a=b'); // true
		 * cookieExists('a=d'); // false
		 *
		 * @return {boolean} `true` if it exists, `false` otherwise.
		 * @readOnly
		 */
		'cookieExists': {
			'value': function cookieExists (cookie) {
				return new RegExp('; ' + cookie + '(=|;)').test('; ' + document.cookie + ';');
			}
		},
		/**
		 * Returns a cookie from `document.cookie`.
		 *
		 * @function
		 * @static
		 * @param {string} name - The cookie name.
		 *
		 * @return {string|null} The cookie if it exists or null.
		 * @readOnly
		 */
		'getCookie': {
			'value': function getCookie (name) {
				return (!/=/.test(name) && LocalStorage.cookieExists(name)
					? ('; ' + document.cookie).split('; ' + name + '=').pop().split(';')[0]
					: null
				);
			}
		}
	});

	Object.defineProperties(LocalStorage.prototype, /** @lends APR.LocalStorage.prototype */{
		/**
		 * Options/flags for the creation of the cookie.
		 * 
		 * @typedef {!object} APR.LocalStorage~setCookie_options
		 * @property {string} [secure=location.protocol === 'https:']
		 *     "secure" flag for the cookie.
		 */

		/**
		 * Concatenates a value to `document.cookie`.
		 *
		 * @function
		 * @param {string} name - The name of the cookie.
		 * @param {string} value - The value of the cookie.
		 * @param {!object} [opts=DEFAULT_OPTIONS]
		 *     Cookie options.
		 * @property {APR.LocalStorage~setCookie_options} DEFAULT_OPTIONS
		 *     Default options/flags.
		 *
		 * @return {boolean} `true` if was set, `false` otherwise.
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
		 * Overrides a cookie by setting an empty value and expiring it.
		 * 
		 * @function
		 * @param {string} name - The name of the cookie.
		 * @param {object} [opts=DEFAULT_OPTIONS] - Some extra options.
		 * @property {APR.LocalStorage~setCookie_options} DEFAULT_OPTIONS - A read only property.
		 *
		 * @return {boolean} `true` if was overriden or the cookie
		 *     does not exist, `false` otherwise.
		 */
		'removeCookie': {
			'value': Object.defineProperties(function removeCookie (name, opts) {
				
				var options = defaults(opts, removeCookie.DEFAULT_OPTIONS);

				if (!LocalStorage.cookieExists(name)) {
					return true;
				}

				return this.setCookie(name, '', options);

			}, {
				'DEFAULT_OPTIONS': {
					'get': function () {
						return {
							'expires': new Date(0)
						};
					}
				}
			})
		},
		/**
		 * Any of "cookie", "localStorage", "sessionStorage"...
		 *
		 * @typedef {string} APR.LocalStorage~isStorageAvailable_type
		 */

		/**
		 * Tests if the specified storage does not throw.
		 *
		 * @function
		 * @param {APR.LocalStorage~isStorageAvailable_type} type
		 *     A type of storage.
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
						LocalStorage.getCookie(_) === _ &&
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

	return APR.module.LocalStorage = LocalStorage;

});