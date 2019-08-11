define([
	'./core',
	'./check',
	'./eachProperty',
	'./defaults'
], function (
	APR,
	check,
	eachProperty,
	defaults
) {

	'use strict';
	/**
	 * Recursive function that flattens object literals.
	 *
	 * @param {!?object} object - The object literal to flat.
	 * @param {!object} options - The options.
	 * @param {String} [previousKey] The previous key.
	 *
	 * @return {!?object} The flattened object.
	 */
	function flattenObject (object, options, previousKey) {

		var results = {};

		eachProperty(object, function (value, key) {
				
			var flattenedKey = (previousKey
				? previousKey + options.separator + key
				: key
			);

			if (check(value, {})) {
				Object.assign(results, flattenObject(value, options,
					flattenedKey));
			}
			else {
				results[flattenedKey] = value;
			}

		});

		return results;

	}

	return APR.setFn('flattenObjectLiteral', /** @lends APR */
	/**
	 * Flattens an object of objects.
	 *
	 * @function
	 * @param {?object} object - Some object.
	 * @param {?object} [
	 *     opts={@link APR~flattenObjectLiteral.DEFAULT_OPTIONS}
	 * ]
	 * @throws {TypeError} - If `object` is not a an object literal.
	 *
	 * @example
	 * flattenObjectLiteral({'a': {'b': {'c': {'d': 1}}}}); // {'a.b.c.d' : 1}
	 *
	 * @return {?object} - The flattened object.
	 */
	function flattenObjectLiteral (object, opts) {
		return flattenObject(
			check.throwable(object, {}),
			defaults(opts, flattenObjectLiteral.DEFAULT_OPTIONS),
			null
		);
	}, /** @lends APR.flattenObjectLiteral */{
		/**
		 * Default options for {@link APR.flattenObjectLiteral}.
		 *
		 * @type {object}
		 * @property {String} [separator=""] - A string to join the keys.
		 */
		'DEFAULT_OPTIONS': {
			'get': function () {
				return {
					'separator': '.'
				};
			}
		}
	});

});