define([
	'./eachProperty',
	'./isKeyValueObject',
	'./isEmptyObject'
], function (eachProperty, isKeyValueObject, isEmptyObject) {

	/**
	 * Fills a key-value object with `data`.
	 *
	 * @param {Object<key, value>} structure The structured data to be filled.
	 * 										If the value of some property is an array,
	 										the value gets pushed to the array.
	 * @param {Object} data The new contents added to the structure.
	 * @param {Boolean} preserveUndefined If it's a truthy value, `undefined` values in
	 * 										-the structure- will become an optional key
	 * 										that will be present only if `data` contains
	 * 										that property (even if it's `undefined`).
	 * @return {!Object<key, value>} A new object preserving the given structure.
	 * @example <caption>`undefined` values get removed by default.</caption>
	 * fill({
	 *     'a': void 0,
	 *     'b': null,
	 *     'c': []
	 * }, {
	 *     'c': {'some': 'value'},
	 *     'd': 'ignored'
	 * }); // {'b': null, 'c': [{'some': 'value'}]}
	 *
	 * @example <caption>Passing a third argument preserves `undefined` values.</caption>
	 * fill({'a': void 0}, null, true); // {'a': void 0}
	 */
	return function fill (structure, data, preserveUndefined) {

		var filled = {};

		if (!isKeyValueObject(structure)) {
			throw new TypeError(structure + ' must be a key-value object.');
		}

		if (typeof data === 'undefined' || typeof data === 'object' && isEmptyObject(data)) {
			return Object.assign({}, structure);
		}

		if (!isKeyValueObject(data)) {
			throw new TypeError(data + ' must be null or a key-value object.');
		}

		eachProperty(structure, function (currentValue, currentKey) {

			var newValue = data[currentKey];

			if (currentValue === void 0 && preserveUndefined) {
				return;
			}

			if (!(currentKey in data)) {
				filled[currentKey] = currentValue;
				return;
			}

			if (Array.isArray(currentValue)) {
				currentValue.push(newValue);
				newValue = currentValue;
			}

			filled[currentKey] = newValue;

		});

		return filled;

	};

});