define(function () {

	'use strict';

	/**
	 * An absolute, relative or blob url.
	 *
	 * @typedef {string} url
	 * @global
	 */

	/**
	 * The full parts of an url.
	 * 
	 * @typedef {Object} url_parts
	 * @property {string} protocol - A protocol (including ":", like "ftp:") or ":".
	 * @property {string} href - An absolute url (like "ftp://username:password@www.example.com:80/a?b=1#c").
	 * @property {string} host - The host (like "www.example.com:80") or an empty string.
	 * @property {string} hostname - A hostname (like "www.example.com").
	 * @property {string} port - The GIVEN port as a number (like "80") or an empty string.
	 * @property {string} pathname - A pathname (like "/a").
	 * @property {string} origin - The origin (like "ftp://www.example.com").
	 * @property {string} search - The query arguments (including "?", like "?b=1") or an empty string.
	 * @property {string} hash - The hash (including '#', like "#c") or an empty string.
	 * @property {string} username - The given username or an empty string.
	 * @property {string} password - The given password or an empty string.
	 */
	
	/**
	 * Same as the second param for `Object.defineProperties`
	 * 
	 * @typedef {!object} propertiesDescriptor
	 * @global
	 */
	
	/**
	 * Same as the third param for `Object.defineProperty`
	 *
	 * @typedef {!object} propertyDescriptor
	 * @global
	 */

	/**
	 * A tagName of an Element (such as "link").
	 *
	 * @typedef {string} element_tag
	 */

	/**
	 * @mixin APR
	 * @global
	 */
	var APR = {};

	return Object.defineProperties(APR, /** @lends module:APR */{
		// 'version': '%{CORE_VERSION}%',
		/**
		 * Defines or modifies a property in {@link APR}.
		 *
		 * @package
		 * @readOnly
		 * @function
		 *
		 * @param {!string} name - The name of the APR property.
		 * @param {!propertyDescriptor|*} descriptor - The value of the
		 *     property or a {@link propertyDescriptor}.
		 * @return {*} The added property.
		 */
		'property': {
			'set': function setProperty (name, descriptor) {
				if (!('value' in Object(descriptor))) {
					descriptor = {
						'value': descriptor
					};
				}

				return Object.defineProperty(APR, name, descriptor);
			}
		},
		/**
		 * Sets a function in {@link APR}.
		 *
		 * @function
		 * @package
		 * @readOnly
		 *
		 * @param {!string} name - The name of the APR property.
		 * @param {!function} fn - Some function.
		 *
		 * @return {!function} fn. 
		 */
		'fn': {
			'set': function setFn (name, fn) {
				return APR.property.name = fn;
			}
		},
		/**
		 * Sets a module in {@link APR}.
		 *
		 * @package
		 * @readOnly
		 * @function
		 * @param {!string} name - The name of the APR property.
		 * @param {!function} fn - Some constructor.
		 *
		 * @returns {!function} fn. 
		 */
		'module': {
			'set': function setModule (name, fn) {
				return APR.fn.name = fn;
			}
		}
	});
	
});
