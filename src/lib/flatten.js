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

	/**
	 * A factory for the "flatten..." alternatives.
	 * 
	 * @throws {TypeError} If the value couldn't be flattened.
	 */	
	return APR.setFn('flatten', function flatten (value) {

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