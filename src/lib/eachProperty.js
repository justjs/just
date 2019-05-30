define([
	'./hasOwn'
], function (hasOwn) {
	
	'use strict';

	/**
	 * A function that will be called in each iteration.
	 * 
	 * @typedef {function} APR~eachProperty_fn
	 * @this {*} `thisArg` of {@link APR.eachProperty}.
	 * @param {*} value The value of the current `key` in `object`.
	 * @param {string} key The current key of `object`.
	 * @param {!Object} object The object that is being iterated.
	 * @return {*} Some value.
	 */
	
	/**
	 * Iterates the properties of a JSON-like object.
	 * 
	 * @param  {!Object}  properties A JSON-like object to iterate.
	 * @param  {APR~eachProperty_fn} fn The function that will be called in each iteration.
	 * @param  {*} thisArg `this` for `fn`.
	 * @param  {boolean} [strict=false] false: iterate only the owned properties.
	 *                                  true: iterate the (enumerable) inherited properties too.
	 * @return {!Object} The returned values.
	 */
	return function eachProperty (properties, fn, thisArg, strict) {

		var returnedValues = {};
		var k;

		for (k in properties) {

			if (strict || hasOwn(properties, k)) {
				returnedValues[k] = fn.call(thisArg, properties[k], k, properties);
			}

		}

		return returnedValues;

	};

});