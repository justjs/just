define(['./core', './check'], function (APR, check) {

	'use strict';

	return APR.setFn('toKeyValueObject',
	/**
	 * Converts [[k0, v0], {k1: v1}] to {k0: v0, k1: v1}.
	 *
	 * @function APR.toKeyValueObject
	 * @param {?Array|Object.<key, value>} array An array containing sub-arrays
	 *     with key-value pairs, or key-value objects: [[k, v], {k: v}].
	 *
	 * @return {!Object<key, value>}
	 */
	function toKeyValueObject (array) {

		var keyValueObject = {};

		if (check(array, {}, null)) {
			return Object.assign({}, array);
		}

		if (!check(array, [])) {
			throw new TypeError(array + ' must be either ' +
				'null, a key-value object or an Array.');
		}

		array.forEach(function (subArray) {

			var key, value;

			if (check(subArray, [])) {
				key = subArray[0];
				value = subArray[1];
				this[key] = value;
			}
			else if (check(subArray, {})) {
				Object.assign(this, subArray);
			}
			else {
				throw new TypeError(subArray + ' must be either ' +
					'a key-value object or an Array.');
			}
			

		}, keyValueObject);

		return keyValueObject;

	});

});