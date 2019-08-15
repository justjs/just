define([
	'./core',
	'./flattenObjectLiteral',
	'./flattenArray',
	'./check'
], function (
	APR,
	flattenObjectLiteral,
	flattenArray,
	check
) {

	'use strict';

	/**
	 * A factory for the "flatten..." alternatives.
	 * 
	 * @namespace
	 * @memberof APR
	 * @param {...*} value - Arguments for {@link APR.flattenArray}
	 *     if the first argument is an Array, or arguments for
	 *     {@link APR.flattenObjectLiteral}.
	 * @throws {TypeError} If the value couldn't be flattened.
	 * @return {Array|!object} The flattened value.
	 */
	var flatten = function flatten (value) {

		var args = Array.from(arguments);
		var flattened;

		if (check(value, {})) {
			flattened = flattenObjectLiteral.apply(this, args);
		}
		else if (check(value, [])) {
			flattened = flattenArray.apply(this, args);
		}
		else {
			throw new TypeError(value + ' couldn\'t be flattened.');
		}

		return flattened;

	};

	return APR.fn.flatten = flatten;

});