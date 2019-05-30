define([
	'./flattenKeyValueObject',
	'./flattenArray',
	'./isKeyValueObject'
], function (
	flattenKeyValueObject,
	flattenArray,
	isKeyValueObject
) {


	/**
	 * A factory for the "flatten..." alternatives.
	 * 
	 * @throws {TypeError} If the value couldn't be flattened.
	 */	
	return function flatten (value) {

		var args = Array.from(arguments);
		var flattened;

		if (isKeyValueObject(value)) {
			flattened = flattenKeyValueObject.apply(this, args);
		}
		else if (Array.isArray(value)) {
			flattened = flattenArray.apply(this, args);
		}
		else {
			throw new TypeError(value + ' couldn\'t be flattened.');
		}

		return flattened;

	};

});