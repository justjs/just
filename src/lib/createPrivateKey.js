define([
	'./core'
], function (APR) {

	'use strict';

	return APR.setFn('createPrivateKey', /** @lends APR */
	/**
	 * An store of private members.
	 *
	 * @typedef {function} APR~createPrivateKey_privateStore
	 * @param {!Object} key - Some object to get/set properties from/to it.
	 * @return {function} - A private store.
	 */

	/**
	 * Implementation of private members in js.
	 * @see {@url https://github.com/philipwalton/private-parts/blob/master/private-parts.js|Source}.
	 *
	 * @function
	 * @param {function|?object} [factory=Object.prototype] - A new object with `factory` as it's prototype...
	 * @param {?object} [parent] - The object to {@link APR.inheritFrom|inherit from}.
	 * @throws {TypeError} - If the key given {@link APR~createPrivateKey_privateStore|in the private store}
	 *                       is not an object.
	 * @example
	 * // Creates an store which extends the public-constructor prototype.
	 * // So you can call the public methods from the private ones.
	 * var _ = createPrivateKey({
	 *     privateMethod: function () {
	 *         console.log(this); // Shows something like: {public: 'public', privateMethod: function(){}, prototype: Public.prototype, [...]}.
	 *     }
	 * }, Public);
	 *
	 * // Some constructor.
	 * function Public () {
	 *     this.public = 'public';
	 *     // Note that `this` is an object.
	 *     _(this).private = 'private';
	 * }
	 *
	 * console.log(new Public()); // Shows [...] {public: 'public'}
	 *
	 * @return {APR~createPrivateKey_privateStore} - An store of the private values.
	 */
	function createPrivateKey (factory, parent) {

		var store = new WeakMap();
		var seen = new WeakMap();

		if (parent instanceof Object) {
			factory = Object.assign(Object.create(parent.prototype), factory);
		}

		if (typeof factory !== 'function') {
			factory = Object.create.bind(null, factory || Object.prototype, {});
		}

		return function (key) {

			var value;

			if (!(key instanceof Object)) {
				throw new TypeError(key + ' must be an object.');
			}

			if (value = store.get(key)) {
				return value;
			}

			if (seen.has(key)) {
				return key;
			}

			value = factory(key);
			store.set(key, value);
			seen.set(value, true);

			return value;

		};

	});

});
