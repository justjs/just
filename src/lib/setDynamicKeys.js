define([
	'./isKeyValueObject'
], function (isKeyValueObject) {

	'use strict';

	/**
	 * Set keys of `object` as if it were an array. (Same as {[variable]: 'value'} in most recent browsers).
	 * 
	 * @param {*} [object=Object] The base object.
	 * @param {Array} properties A pair of values: 2n being the key, 2n + 1 being the value.
	 * @throws {TypeError} If the given `properties` are not an array-like.
	 * @example
	 *
	 * var obj = {};
	 *
	 * ['a', 'b', 'c'].map(function (key, index, array) {
	 *     
	 *     return setDynamicKeys(this, [
	 *         key, index
	 *     ]);
	 *     
	 * }, obj); // returns [{a: 0}, {a: 0, b: 1}, {a: 0, b: 1, c: 2}]
	 * // now, `obj` is {a: 0, b: 1, c: 2}.
	 * 
	 * @return {!Object} `object` with the given `properties` added.
	 */
	return function setDynamicKeys (object, properties) {

		var i, f, key, value;

		if (!('length' in properties)) {
			throw new TypeError('The given keys are not an array-like.');
		}

		if (!isKeyValueObject(object)) {
			object = {};
		}

		for (i = 0, f = properties.length - 1; i < f; i += 2) {
			key = properties[i];
			value = properties[i + 1];
			object[key] = value;
		}

		return object;

	};

});