define([
	'./core',
	'./flattenKeyValueObject',
	'./flattenArray',
	'./check'
], function (
	APR,
	flattenKeyValueObject,
	flattenArray,
	check
) {

	'use strict';

	return APR.setFn('flatten',
	/**
	 * A factory for the "flatten..." alternatives.
	 * 
	 * @function APR.flatten
	 * @param {...*} value Arguments for {@link APR.flattenArray}
	 *     if the first argument is an Array, or arguments for
	 *     {@link APR.flattenKeyValueObject}.
	 * @throws {TypeError} If the value couldn't be flattened.
	 * @return {Array|key-value-object} The flattened value.
	 */
	function flatten (value) {

		var args = Array.from(arguments);
		var flattened;

		if (check(value, {})) {
			flattened = flattenKeyValueObject.apply(this, args);
		}
		else if (check(value, [])) {
			flattened = flattenArray.apply(this, args);
		}
		else {
			throw new TypeError(value + ' couldn\'t be flattened.');
		}

		return flattened;

	});

});