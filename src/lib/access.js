define(['./core', './defaults'], function (APR, defaults) {

	'use strict';

	return APR.setFn('access',
	/**
	 * Default options for {@link APR.access}.
	 *
	 * @typedef {!key-value-object} APR~access_options
	 *
	 * @property  {boolean} [mutate=false] If `true`, it will use
	 *     the given object as the base object, otherwise it will
	 *     copy all the owned properties to a new object.
	 *
	 * @property {boolean} [override=true] If `true`, and the
	 *     current value is different to `null` or `undefined`,
	 *     the function will throw a TypeError.
	 *     If `false`, the current value will be overriden by
	 *     an empty object if it's not an object nor `undefined`.
	 *
	 */

	/**
	 * A function to call when it reaches the deep property of an object.
	 *
	 * @typedef {function} APR~access_handler
	 *
	 * @this {!Object} A new object with the properties of the base object.
	 *
	 * @param {!Object} lastObject The object containing the `lastKey`.
	 * @param {string} lastKey The last value given in `path`.
	 * @param {boolean} hasProperty false if some key of `path` was created, true otherwise.
	 * @param {string[]} path The given keys.
	 * @return {*} The return value for {@link APR~access|the main function}.
	 */

	/**
	 * Accesses to a deep property in a new `object` (or `object` if `mutate` evals to `true`).
	 *
	 * @function APR.access
	 * @param  {!Object} object The base object.
	 * @param  {string[]} [path=[path]] The ordered keys.
	 * @param  {APR~access_handler} [handler] A custom function.
	 * @param  {APR~access_options} [opts={@link APR~access_options|APR.access.DEFAULT_OPTIONS}] Some options.
	 *
	 * @throws {TypeError} If some property causes access problems.
	 *
	 * @example <caption>Accessing to some existent property</caption>
	 *
	 * access({a: {b: {c: {d: 4}}}}, ['a', 'b', 'c', 'd'], function (currentObject, currentKey, hasProperty, path) {
	 *     return hasProperty ? currentObject[currentKey] : null;
	 * }); // returns 4.
	 *
	 * @example <caption>Accessing to some property with a non-JSON-like-object as a value</caption>
	 *
	 * access({a: 1}, ['a', 'b', 'c']); // throws TypeError.
	 * access({a: 1}, ['a', 'b', 'c'], null, {
	 *     'override': true
	 * }); // returns undefined.
	 * // Doesn't throw because it replaces `1` with an empty object
	 * // and keeps accessing to the next properties.
	 *
	 * @example <caption>Accessing to some non-existent property</caption>
	 *
	 * var obj = {z: 1, prototype: [...]};
	 * var newObj = access(obj, 'a.b.c'.split('.'), function (currentObject, currentKey, hasProperty, path) {
	 *
	 *     if (!hasProperty) {
	 *         currentObject[currentKey] = path.length;
	 *     }
	 *
	 *     // At this point:
	 *     //     `obj` is {z: 1},
	 *     //     `currentObject` has a value in `currentKey`,
	 *     //     and `this` has all the added keys (even the ones modified in `currentObject`).
	 *     return this;
	 *
	 * }); // returns {z: 1, a: {b: {c: 3}}}
	 *
	 * // if you want the prototype chain of obj, just copy it.
	 * Object.assign(newObj.prototype, obj.prototype);
	 *
	 * @example <caption>Modifying the base object</caption>
	 *
	 * var obj = {a: {b: false}, b: {b: false}, prototype: [...]};
	 *
	 * access(obj, 'a.b'.split('.'), function (currentObject, currentKey, hasProperty, path) {
	 *     currentObject[currentKey] = 2;
	 * }, true);
	 *
	 * // now `obj` is {a: {a: true}, b: {b: true}, prototype: [...]}.
	 *
	 * @return {*} If `handler` is given: the returned value of that function,
	 *         otherwise: the last value of `path` in the copied object.
	 */
	function access (object, path, handler, opts) {

		var options = defaults(opts, access.DEFAULT_OPTIONS);
		var properties = defaults(path, [path]);
		var initialObject = (options.mutate
			? object
			: Object.assign({}, object)
		);
		var currentObject = initialObject;
		var hasProperty = true;

		properties.forEach(function (key, i) {

			if (i === properties.length - 1) {

				currentObject = (handler
					? handler.call(initialObject, currentObject,
						key, hasProperty, properties)
					: currentObject[key]
				);

				return;

			}

			if (!(currentObject[key] instanceof Object)) {

				if (typeof currentObject[key] !== 'undefined' &&
					currentObject[key] !== null && !options.override) {

					throw new TypeError('The value of "' +
						key + '" is not an object.');

				}

				hasProperty = false;
				currentObject[key] = {};

			}

			currentObject = currentObject[key];

		});

		return currentObject;

	}, /** @lends APR.access */{
		/**
		 * @type {APR~access_options}
		 * @readOnly
		 */
		'DEFAULT_OPTIONS': {
			'get': function () {
				return {
					'override': true,
					'mutate': false
				};
			}
		}
	});

});
