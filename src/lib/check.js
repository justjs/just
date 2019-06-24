define(['./core'], function (APR) {

	'use strict';

	/**
	 * A function that `check`s a value against others and
	 * throws if the result is `false`.
	 *
	 * @typedef {function} APR~check_throwable 
	 *
	 * @this {string} A custom message to throw.
	 *
	 * @param {*} value Comparison value.
	 * @param {*} [...otherValues] Values to check against.
	 *
	 * @throws {TypeError} If `check` returns `false`.
	 *
	 * @returns `value` if `check` returns `true`.
	 */

	/**
	 * Checks if `value` looks like the other values.
	 *
	 * @param {*} value Comparison value.
	 * @param {*} [...otherValues] Values to check against.
	 *
	 * @example
	 *
	 * check(null, {}, "null", []); // false. Neither is `null`.
	 * check({}, [], {}); // true. {} is {}.
	 *
	 * @return {boolean} `true` if some `otherValue` looks like `value`.
	 */
	return APR.setFn('check', function check (value, otherValues) {

		var toString = ({}).toString;

		return [].some.call(arguments, function (otherValue, i) {
		
			return i && this === toString.call(otherValue);
	
		}, toString.call(value));

	}, /** @lends APR.check */{
		/**
		 * @property {APR~check_throwable} throwable
		 */
		'throwable': {
			'value': function (value, otherValues) {

				var args = Array.from(arguments);
				var throwableMessage = this || (value +
					' must be like one of the following values: ' +
					args.splice(1)
				);

				if (!APR.check.apply(null, args)) {
					throw new TypeError(throwableMessage);
				}

				return value;

			}
		}

	});

});