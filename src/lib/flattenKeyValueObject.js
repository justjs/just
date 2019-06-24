define([
	'./check',
	'./eachProperty'
], function (
	check,
	eachProperty
) {

	'use strict';

	/**
	 * Recursive function that flattens key-value objects.
	 *
	 * @param {Object<key, value>} object The key-value object to flat.
	 * @param {String} [previousKey] The previous key.
	 * @return {!Object<key, value>} The flattened object.
	 */
	function flattenObject (object, previousKey) {

		var results = {};
		var separator = flattenKeyValueObject.separator;

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

	/**
	 * Flattens an object of objects.
	 *
	 * @param {Object<key, value>} object Some object.
	 * @property {String} [separator='.'] The separator used to join the deep keys.
	 * @throws {TypeError} If `object` is not a key-value object.
	 * @example
	 * flattenKeyValueObject({'a': {'b': {'c': {'d': 1}}}}); // {'a.b.c.d' : 1}
	 */
	function flattenKeyValueObject (object) {
		return flattenObject(check.throwable(object, {}));
	}

	return Object.defineProperties(flattenKeyValueObject, {
		'separator': {
			'value': '.',
			'writable': true
		}
	});

});