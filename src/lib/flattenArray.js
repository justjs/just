define(['./defaults'], function (defaults) {

	/**
	 * Flattens an array of arrays.
	 *
	 * @param {Array} [value=[array]] The target.
	 * @param {Number} [maxLevel=-1] Maximum deep-level to flatten.
	 * @example
	 * var arrayLike = {'0': [0, [1, [2]]]}; 
	 * var array = Array.from(arrayLike);
	 * var maxLevel = 1;
	 *
	 * flattenArray(array, maxLevel) // [0, 1, [2]]
	 *
	 * @return [!Array] The flatten array.
	 */
	return function flattenArray (value, maxLevel) {

		var array = defaults(value, [value]);
		var flattened = [];

		if (typeof maxLevel !== 'number') {
			maxLevel = -1;
		}

		if (maxLevel === 0) {
			return array;
		}

		array.forEach(function (value) {

			flattened = flattened.concat(Array.isArray(value) && maxLevel !== 0
				? flattenArray(value, maxLevel - 1)
				: value
			);

		});

		return flattened;

	};

});