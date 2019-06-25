define(['./stringToJSON'], function (stringToJSON) {
	
	'use strict';

	/**
	 * Checks if `value` is an object in a "JSON format".
	 * 
	 * @param {*} value Some value.
	 * @example
	 * isKeyValueObject([1, 2]); // false.
	 *
	 * @example
	 * isKeyValueObject({a: 1}); // true.
	 *
	 * @returns {Boolean}
	 */
	return function isKeyValueObject (value) {

		var isIt;

		try {
			
			isIt = (
				value instanceof Object &&
				value.toString() === '[object Object]'
			);

		} catch (toStringException) {
			
			try {
				isIt = stringToJSON(JSON.stringify(value));
			} catch (cyclicException) {
				isIt = !!Object.keys(value).length;
			}

		}
		
		return isIt;

	};

});