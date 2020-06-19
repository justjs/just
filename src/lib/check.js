var defineProperties = require('./defineProperties');

/**
 * Checks if <var>value</var> looks like the other values.
 *
 * @namespace
 * @memberof just
 * @param {*} value - Comparison value.
 * @param {...*} [otherValues] - Values to check against.
 *
 * @example
 * check(null, {}, "null", []); // false. Neither is `null`.
 * check({}, [], {}); // true. {} is {}.
 *
 * @return {boolean} `true` if some other value looks like <var>value</var>.
 */
function check (value, otherValues) {

    var exceptFirstArg = [].slice.call(arguments, 1);

    return exceptFirstArg.some(function checkAgainst (arg) {

        return ([arg, value].some(function hasNoProps (v) { return v === null || v === void 0; })
            ? arg === value
            : arg.constructor === value.constructor
        );

    });

}

defineProperties(check, /** @lends just.check */{

    /**
     * A custom message to throw.
     *
     * @typedef {string} just.check~throwable_message
     */

    /**
     * A function that {@link just.check|checks} a value against others and
     * throws if the result is `false`.
     *
     * @function
     * @this just.check~throwable_message
     * @param {*} value - Comparison value.
     * @param {...*} [otherValues] - Values to check against.
     *
     * @throws {TypeError} If <var>check</var> returns `false`.
     * @returns {value} <var>value</var> if <var>check</var> returns `true`.
     */
    'throwable': function (value, otherValues) {

        var args = [].slice.call(arguments);
        var throwableMessage = this;

        if (!check.apply(this, args)) {

            if (!(throwableMessage instanceof String)) {

                throwableMessage = (value
                    + ' must be like one of the following values: '
                    + args.slice(1).map(function (v) { return v + ''; }).join(', ')
                );

            }

            throw new TypeError(throwableMessage);

        }

        return value;

    }

});

module.exports = check;
