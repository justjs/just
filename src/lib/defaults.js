define([
	'./isKeyValueObject',
	'./eachProperty'
], function (isKeyValueObject, eachProperty) {
	
	'use strict';

	/**
	 * Checks if `value` looks like `defaultValue`.
	 *
	 * @param {*} value Any value-
	 * @param {*} defaultValue A value with a desired type for `value`.
	 * 						   If a key-value object is given, all the keys of `value` will `default`
	 * 						   to his corresponding key in this object.
	 * @param {boolean} ignoreDefaultKeys If evaluates to `false` and `defaultValue` is an json-like object,
	 * 									  the default keys will be added to `value` or checked against this
	 * 									  function for each repeated key.
	 *
	 * @example
	 * defaults([1, 2], {a: 1}); // {a: 1}
	 * 
	 * @example
	 * defaults({}, null); // {}: null is an object.
	 * defaults([], null); // []: null is an object.
	 * defaults(null, {}); // {}: null is not a key-value object.
	 * defaults(null, []); // []: null is not an Array.
	 * 
	 * @example
	 * defaults(1, NaN); // 1 (NaN is an instance of a Number)
	 *
	 * @example
	 * defaults({'a': 1, 'b': 2}, {'a': 'some string'}, false); // {'a': 'some string', 'b': 2}
	 *
	 * @example
	 * defaults({'a': 1}, {'b': 2}, false); // {'a': 1, 'b': 2}
	 * defaults({'a': 1}, {'b': 2}, true); // {'a': 1}
	 *
	 * @returns `value` if it looks like `defaultValue` or `defaultValue` otherwise.
	 */
	return function defaults (value, defaultValue, ignoreDefaultKeys) {

		if (Array.isArray(defaultValue)) {
			return Array.isArray(value) ? value : defaultValue;
		}

		if (isKeyValueObject(defaultValue)) {
			
			if (!isKeyValueObject(value)) {
				return defaultValue;
			}

			eachProperty(defaultValue, function (v, k) {

				if (typeof value[k] !== 'undefined') {
					value[k] = defaults(value[k], v);
				}
				else if (!ignoreDefaultKeys) {
					value[k] = v;
				}

			});

			return value;

		}

		return typeof value === typeof defaultValue ? value : defaultValue;

	};

});