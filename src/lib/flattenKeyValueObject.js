define([
	'./hasOwn',
	'./isKeyValueObject'
], function (hasOwn, isKeyValueObject) {

	/**
	 * Recursive function that flattens key-value objects.
	 *
	 * @param {Object<key, value>} object The key-value object to flat.
	 * @param {String} [previousKey] The previous key.
	 * @return {!Object<key, value>} The flattened object.
	 */
	function flatten (object, previousKey) {

		var results = {};
		var key, value, flattenedKey;

		for (key in object) {

			if (!hasOwn(object, key)) {
				continue;
			}
				
			value = object[key];
			flattenedKey = (previousKey
				? previousKey + flattenKeyValueObject.PROPERTY_SEPARATOR + key
				: key
			);

			if (isKeyValueObject(value)) {
				Object.assign(results, flatten(value, flattenedKey));
			}
			else {
				results[flattenedKey] = value;
			}

		}

		return results;

	}

	/**
	 * Flattens an object of objects.
	 *
	 * @param {Object<key, value>} object Some object.
	 * @property {String} [PROPERTY_SEPARATOR='.'] The separator used to join the deep keys.
	 * @throws {TypeError} If `object` is not a key-value object.
	 * @example
	 * flattenKeyValueObject({'a': {'b': {'c': {'d': 1}}}}); // {'a.b.c.d' : 1}
	 */
	function flattenKeyValueObject (object) {

		if (!isKeyValueObject(object)) {
			throw new TypeError(object + ' must be a key-value object.');
		}

		return flatten(object);

	}

	return Object.assign(flattenKeyValueObject, {
		'PROPERTY_SEPARATOR': '.'
	});

});