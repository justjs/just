/**
 * Replace a function with another.
 * NOTE: The original function won't be saved.
 *
 * @param {!object} object - Any object.
 * @param {!string} key - The key for <var>object</var> containing the function.
 * @param {!function} newFn - The replacent for <var>object[key]</var>.
 */
exports.mock = function (object, key, newFn) {

    object[key] = function () {

        return newFn.apply(this, [].slice.call(arguments));

    };

};

/**
 * {@link mock|Mock} <var>object[key]</var>, <var>intercept</var> it,
 * call the original function and call <var>then</var> afterwards.
 *
 * @param {!object} object - The object containing the function.
 * @param {!string} key - The key for <var>object</var> that contains the function.
 * @param {!function} intercept - A function with the same values as <var>object[key]</var>.
 * @param {?function} then - A function with the same values as <var>object[key]</var>.
 */
exports.spyOn = function (object, key, intercept, then) {

    var originalFn = object[key];

    object[key] = function () {

        var args = [].slice.call(arguments);
        var originalReturn;

        intercept.apply(this, args);
        originalReturn = originalFn.apply(this, args);
        if (typeof then === 'function') { then.apply(this, args); }

        return originalReturn;

    };

};

/**
 * Find <var>value</var> in <var>values</var> and remove it if it was found.
 *
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
