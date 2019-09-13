/**
 * Replace a function with another.
 * NOTE: The original function won't be saved.
 *
 * @param {function} originalFn
 * @param {function} newFn
 */
exports.mock = function (object, key, newFn) {
	object[key] = function () {
		return newFn.apply(this, [].slice.call(arguments));
	};
};
/**
 * {@link mock|Mock} `fn`, `intercept` it, call the original function
 * and call `then` afterwards.
 * 
 * @param {function} fn - The original function.
 * @param {fn} intercept - A function with the same values as `fn`.
 * @param {fn} then - A function with the same values as `fn`.
 */
exports.spyOn = function (object, key, intercept, then) {
	var originalFn = object[key];

	object[key] = function () {
		var args = [].slice.call(arguments);
		var originalReturn;

		intercept.apply(this, args);
		originalReturn = originalFn.apply(this, args);
		then.apply(this, args);

		return originalReturn;
	};
};
/**
 * @param {*} value
 * @param {array} values
 * @return {boolean} `true` if `value` was found, `false` otherwise. 
 */
exports.findInArrayAndRemove = function (value, values) {
	return values.some(function (v, i) {
		if (value === v) {
			values.slice(i);
			return true;
		}

		return false;
	});
};