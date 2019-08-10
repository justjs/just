define([
	'./core',
	'./check',
	'./eachProperty',
	'./defaults'
], function (
	APR,
	check,
	eachProperty,
	defaults
) {

	'use strict';
	/**
	 * Default options for {@link APR.flattenKeyValueObject}.
	 *
	 * @typedef {key-value-object} APR~flattenKeyValueObject_options
	 * 
	 * @property {String} [separator=""] A string to join the keys.
	 */

	/**
	 * Recursive function that flattens {@link key-value-object}s.
	 *
	 * @param {!key-value-object} object The {@link key-value-object} to flat.
	 * @param {!APR~flattenKeyValueObject_options} options The options.
	 * @param {String} [previousKey] The previous key.
	 *
	 * @return {!key-value-object} The flattened object.
	 */
	function flattenObject (object, options, previousKey) {

		var results = {};

		eachProperty(object, function (value, key) {
				
			var flattenedKey = (previousKey
				? previousKey + options.separator + key
				: key
			);

			if (check(value, {})) {
				Object.assign(results, flattenObject(value, options,
					flattenedKey));
			}
			else {
				results[flattenedKey] = value;
			}

		});

		return results;

	}

	return APR.setFn('flattenKeyValueObject',
	/**
	 * Flattens an object of objects.
	 *
	 * @function APR.flattenKeyValueObject
	 * @param {key-value-object} object Some object.
	 * @param {key-value-object} [
	 *     opts={@link APR~flattenKeyValueObject_options|APR.flattenKeyValueObject.DEFAULT_OPTIONS}
	 * ]
	 * @throws {TypeError} If `object` is not a {@link key-value-object}.
	 *
	 * @example
	 * flattenKeyValueObject({'a': {'b': {'c': {'d': 1}}}}); // {'a.b.c.d' : 1}
	 * @return {key-value-object} The flattened object.
	 */
	function flattenKeyValueObject (object, opts) {
		return flattenObject(
			check.throwable(object, {}),
			defaults(opts, flattenKeyValueObject.DEFAULT_OPTIONS),
			null
		);
	}, /** @lends APR.flattenKeyValueObject */{
		/**
		 * @type {APR~flattenKeyValueObject_options}
		 * @readOnly
		 */
		'DEFAULT_OPTIONS': {
			'get': function () {
				return {
					'separator': '.'
				};
			}
		}
	});

});