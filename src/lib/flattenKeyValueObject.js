define([
	'./core',
	'./check',
	'./eachProperty'
], function (
	APR,
	check,
	eachProperty
) {

	'use strict';

	/**
	 * Recursive function that flattens key-value objects.
	 *
	 * @param {Object.<key, value>} object The key-value object to flat.
	 * @param {String} [previousKey] The previous key.
	 *
	 * @return {!Object.<key, value>} The flattened object.
	 */
	function flattenObject (object, previousKey) {

		var results = {};
		var separator = APR.flattenKeyValueObject.separator;

		eachProperty(object, function (value, key) {
				
			var flattenedKey = (previousKey
				? previousKey + separator + key
				: key
			);

			if (check(value, {})) {
				Object.assign(results, flattenObject(value, flattenedKey));
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
	 * @throws {TypeError} If `object` is not a key-value object.
	 *
	 * @example
	 * flattenKeyValueObject({'a': {'b': {'c': {'d': 1}}}}); // {'a.b.c.d' : 1}
	 *
	 * @return {Object.<key, value>} The flattened object.
	 */
	function flattenKeyValueObject (object) {
		return flattenObject(check.throwable(object, {}));
	}, /** @lends APR.flattenKeyValueObject */{
		/**
		 * @property {String} [separator='.'] The separator used to join the deep keys.
		 */
		'separator': {
			'value': '.',
			'writable': true
		}
	});

});