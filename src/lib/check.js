define(['./core'], function (just) {

    'use strict';

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
    var check = function check (value, otherValues) {

        return [].slice.call(arguments, 1).some(function (otherValue, i) {

            if ([value, otherValue].some(
                function (v) { return v === null || v === void 0; }
            )) {

                return otherValue === value;

            }

            return value.constructor === otherValue.constructor;

        });

    };

    Object.defineProperties(check, /** @lends just.check */{
        /**
         *  A custom message to throw.
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
        'throwable': {
            'value': function (value, otherValues) {

                var args = Array.from(arguments);
                var throwableMessage = (!(Object(this) instanceof String) ? (value +
                    ' must be like one of the following values: ' +
                    args.slice(1).map(function (v) { return v + ''; }).join(', ')
                ) : this);

                /* eslint-disable padded-blocks */
                if (!check.apply(this, args)) {
                    throw new TypeError(throwableMessage);
                }
                /* eslint-enable padded-blocks */

                return value;

            }
        }

    });

    return just.setFn('check', check);

});
