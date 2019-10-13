define(['./check'], function (check) {

    'use strict';

    /**
     * Defaults to <var>defaultValue</var> if <var>value</var> looks like
     * <var>defaultValue</var>.
     *
     * @namespace
     * @memberof just
     * @param {*} value - Any value.
     * @param {*} [defaultValue] - A value with a desired type for <var>value</var>.
     *     If an object literal is given, all the keys of <var>value</var> will <var>default</var>
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
     * @returns {value} <var>value</var> if it looks like <var>defaultValue</var> or <var>defaultValue</var> otherwise.
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

    return Object.defineProperties(defaults, /** @lends just.defaults */{
        /**
         * Options for {@link just.defaults}.
         *
         * @typedef {object} just.defaults~options
         *
         * @property {boolean} ignoreDefaultKeys - If `false` and <var>defaultValue</var>
         *     is an object literal, the default keys will be added to <var>value</var>
         *     or checked against this function for each repeated key.
         * @property {boolean} checkLooks
         *     If `true`:
         *         `[]` will match ONLY with another Array.
         *         `{}` will match ONLY with another object literal.
         *     If `false`
         *         `[]` and `{}` will match with any other object.
         * @property {boolean} checkDeepLooks
         *     Same as <var>checkLooks</var> but it works with the inner values
         *     of the objects.
         * @property {boolean} ignoreNull
         *     If `true`, <var>defaultValue</var>s with null as a value won't be checked
         *     and any <var>value</var> (except `undefined`) will be allowed.
         */

        /**
         * Default options for {@link just.defaults}.
         *
         * @type {just.defaults~options}
         * @property {boolean} [ignoreDefaultKeys=false] - Add default keys.
         * @property {boolean} [checkLooks=true] - Check <code>[]</code> and <code>{}</code>.
         * @property {boolean} [checkDeepLooks=true] - <var>checkLooks</var> in literal objects.
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

});
