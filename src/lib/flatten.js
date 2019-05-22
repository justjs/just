define(['./defaults'], function (defaults) {

	/**
	 * Merges an array of arrays.
	 *
	 * @param {Array} [value=[array]] The target.
	 * @param {Number} [maxLevel=-1] Maximum deep-level to flatten.
	 * @example
	 * var arrayLike = {'0': [0, [1, [2]]]}; 
	 * var array = Array.from(arrayLike);
	 * var maxLevel = 1;
	 *
	 * flatten(array, maxLevel) // [0, 1, [2]]
	 *
	 * @return [!Array] The flatten array.
	 */
	return function flatten (value, maxLevel) {

		var array = defaults(value, [value]);
		var flattenArray = [];

		if (typeof maxLevel !== 'number') {
			maxLevel = -1;
		}

		if (maxLevel === 0) {
			return array;
		}

		array.forEach(function (value) {

			flattenArray = flattenArray.concat(Array.isArray(value) && maxLevel !== 0
				? flatten(value, maxLevel - 1)
				: value
			);

		});

		return flattenArray;

	};

});