define(['./core', './check'], function (just, check) {

    'use strict';

    /**
     * Defaults to `defaultValue` if `value` looks like `defaultValue`.
     *
     * @namespace
     * @memberof just
     * @param {*} value - Any value.
     * @param {*} [defaultValue] - A value with a desired type for `value`.
     *     If an object literal is given, all the keys of `value` will `default`
     *     to his corresponding key in this object.
     * @param {just.defaults~options} [opts={@link just.defaults.DEFAULT_OPTIONS}]
     *     Some options.
     *
     * @example
     * defaults([1, 2], {a: 1}); // {a: 1}
     *
     * @example
     * defaults({}, null); // null: null is not an object literal.
     * defaults([], null, {'checkLooks': false}); // []: null is an object.
     * defaults(null, {}); // {}: null is not an object literal.
     * defaults(null, []); // []: null is not an Array.
     *
     * @example
     * defaults(1, NaN); // 1 (NaN is an instance of a Number)
     *
     * @example
     * defaults({'a': 1, 'b': 2}, {'a': 'some string'}, {'ignoreDefaultKeys': false}); // {'a': 'some string', 'b': 2}
     *
     * @example
     * defaults({'a': 1}, {'b': 2}, {'ignoreDefaultKeys': false}); // {'a': 1, 'b': 2}
     * defaults({'a': 1}, {'b': 2}, {'ignoreDefaultKeys': true}); // {'a': 1}
     *
     * @example
     * defaults(1, null, {'ignoreNull': false}) // null (1 is not an object)
     * defaults(1, null, {'ignoreNull': true}) // 1
     * defaults(undefined, null, {'ignoreNull': true}) // null
     * defaults({a: 1}, {a: null}, {'ignoreNull': true}) // {a: 1}
     *
     * @returns {value} `value` if it looks like `defaultValue` or `defaultValue` otherwise.
     */
    var defaults = function defaults (value, defaultValue, opts) {

        var options = Object.assign({}, defaults.DEFAULT_OPTIONS, opts);
        var k;

        /* eslint-disable padded-blocks */
        if (options.ignoreNull && defaultValue === null && value !== void 0) {
            return value;
        }
        /* eslint-enable padded-blocks */

        if (options.checkLooks) {

            /* eslint-disable padded-blocks */
            if (!check(value, defaultValue)) {
                return defaultValue;
            }
            /* eslint-enable padded-blocks */

            if (check(value, {}) && options.checkDeepLooks) {

                for (k in defaultValue) {

                    /* istanbul ignore else */
                    if (({}).hasOwnProperty.call(defaultValue, k)) {

                        if (typeof value[k] !== 'undefined') {

                            value[k] = defaults(value[k],
                                defaultValue[k], options);

                        }
                        else if (!options.ignoreDefaultKeys) {

                            value[k] = defaultValue[k];

                        }

                    }

                }

            }

            return value;

        }

        return (typeof value === typeof defaultValue
            ? value
            : defaultValue
        );

    };

    Object.defineProperties(defaults, /** @lends just.defaults */{
        /**
         * Options for {@link just.defaults}.
         *
         * @typedef {object} just.defaults~options
         *
         * @property {boolean} ignoreDefaultKeys - If `false` and `defaultValue`
         *     is an object literal, the default keys will be added to `value`
         *     or checked against this function for each repeated key.
         * @property {boolean} checkLooks
         *     If `true`:
         *         `[]` will match ONLY with another Array.
         *         `{}` will match ONLY with another object literal.
         *     If `false`
         *         `[]` and `{}` will match with any other object.
         * @property {boolean} checkDeepLooks
         *     Same as `checkLooks` but it works with the inner values
         *     of the objects.
         * @property {boolean} ignoreNull
         *     If `true`, `defaultValue`s with null as a value won't be checked
         *     and any `value` (except `undefined`) will be allowed.
         */

        /**
         * Default options for {@link just.defaults}.
         *
         * @type {just.defaults~options}
         * @property {boolean} [ignoreDefaultKeys=false] - Add default keys.
         * @property {boolean} [checkLooks=true] - Check `[]` and `{}`.
         * @property {boolean} [checkDeepLooks=true] - `checkLooks` in literal objects.
         * @property {boolean} [ignoreNull=false] - Be strict checking `null`s.
         * @readonly
         */
        'DEFAULT_OPTIONS': {
            'get': function () {

                return {
                    'ignoreDefaultKeys': false,
                    'checkLooks': true,
                    'checkDeepLooks': true,
                    'ignoreNull': false
                };

            }
        }

    });

    return just.setFn('defaults', defaults);

});
