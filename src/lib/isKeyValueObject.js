define(function () {
	
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
	 */
	return function isKeyValueObject (value) {
		return /(^\{|\}$)/.test(JSON.stringify(value));
	};

});