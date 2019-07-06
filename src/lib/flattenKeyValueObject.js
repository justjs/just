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
	 * Recursive function that flattens key-value objects.
	 *
	 * @param {Object.<key, value>} object The key-value object to flat.
	 * @param {!Object.<key, value>} [opts=DEFAULT_OPTIONS]
	 * @param {String} [previousKey] The previous key.
	 *
	 * @return {!Object.<key, value>} The flattened object.
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

	return APR.setFn('flattenKeyValueObject', /** @lends APR */
	/**
	 * Flattens an object of objects.
	 *
	 * @param {Object.<key, value>} object Some object.
	 * @param {Object.<key, value>} [opts=DEFAULT_OPTIONS]
	 * @throws {TypeError} If `object` is not a key-value object.
	 *
	 * @example
	 * flattenKeyValueObject({'a': {'b': {'c': {'d': 1}}}}); // {'a.b.c.d' : 1}
	 * @return {Object.<key, value>} The flattened object.
	 */
	function flattenKeyValueObject (object, opts) {
		return flattenObject(
			check.throwable(object, {}),
			defaults(opts, flattenKeyValueObject.DEFAULT_OPTIONS),
			null
		);
	}, /** @lends APR.flattenKeyValueObject */{
		'DEFAULT_OPTIONS': {
			'get': function () {
				return {
					'separator': '.'
				};
			}
		}
	});

});