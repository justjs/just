define(['./core'], function (APR) {

	'use strict';

	/**
	 * Checks if `value` looks like the other values.
	 *
	 * @namespace
	 * @memberof APR
	 * @param {*} value - Comparison value.
	 * @param {...*} [otherValues] - Values to check against.
	 *
	 * @example
	 * check(null, {}, "null", []); // false. Neither is `null`.
	 * check({}, [], {}); // true. {} is {}.
	 *
	 * @return {boolean} `true` if some other value looks like `value`.
	 */
	var check = function check (value, otherValues) {

		return [].some.call(arguments, function (otherValue, i) {

			// Ignore `value`.
			if (i === 0) {
				return;
			}

			if ([value, otherValue].some(function (v) {
				return v === null || v === void 0;
			})) {
				return otherValue === value;
			}

			return value.constructor === otherValue.constructor;
	
		});

	};

	Object.defineProperties(check, /** @lends APR.check */{
		/**
		 *  A custom message to throw.
		 *
		 * @typedef {string} APR.check~throwable_message
		 */

		/**
		 * A function that `check`s a value against others and
		 * throws if the result is `false`.
		 *
		 * @function
		 * @this APR.check~throwable_message
		 * @param {*} value - Comparison value.
		 * @param {...*} [otherValues] - Values to check against.
		 *
		 * @throws {TypeError} If `check` returns `false`.
		 * @returns {value} `value` if `check` returns `true`.
		 */
		'throwable': {
			'value': function (value, otherValues) {

				var args = Array.from(arguments);
				var throwableMessage = (!(Object(this) instanceof String) ? (value +
					' must be like one of the following values: ' +
					args.slice(1).map(function (v) { return v + ''; }).join(', ')
				) : this);

				if (!APR.check.apply(this, args)) {
					throw new TypeError(throwableMessage);
				}

				return value;

			}
		}

	});

	return APR.fn.check = check;

});
