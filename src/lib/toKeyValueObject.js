define(['./core', './check'], function (APR, check) {

	'use strict';

	return APR.setFn('toKeyValueObject', /** @lends APR */
	/**
	 * Converts [[k0, v0], [k1, v1]] to {k0: v0, k1: v1}.
	 *
	 * @param [Array] array An array containing sub-arrays
	 *     with key-value pairs: [[k, v], ...].
	 *
	 * @return {!Object<key, value>}
	 */
	function toKeyValueObject (array) {

		var keyValueObject = {};

		check.throwable(array, []).forEach(function (v) {

			var subArray = check.throwable(v, []);
			var key = subArray[0];
			var value = subArray[1];

			this[key] = value;

		}, keyValueObject);

		return keyValueObject;

	});

});