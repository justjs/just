define([
    './core',
    './check',
    './eachProperty',
    './defaults'
], function (
    just,
    check,
    eachProperty,
    defaults
) {

    'use strict';

    /**
     * Recursive function that flattens object literals.
     *
     * @param {!object} object - The object literal to flat.
     * @param {!object} options - The options.
     * @param {String} [previousKey] - The previous key.
     *
     * @return {!object} The flattened object.
     */
    var flattenObject = function flattenObject (object, options, previousKey) {

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

    };
        /**
         * Flattens an object of objects.
         *
         * @namespace
         * @memberof just
         * @param {!object} object - Some object literal.
         * @param {?object} [
         *     opts={@link just.flattenObjectLiteral.DEFAULT_OPTIONS}
         * ]
         * @throws {TypeError} If `object` is not a an object literal.
         *
         * @example
         * flattenObjectLiteral({'a': {'b': {'c': {'d': 1}}}}); // {'a.b.c.d' : 1}
         *
         * @return {!object} The flattened object.
         */
    var flattenObjectLiteral = function flattenObjectLiteral (object, opts) {

        return flattenObject(
            check.throwable(object, {}),
            defaults(opts, flattenObjectLiteral.DEFAULT_OPTIONS),
            null
        );

    };

    Object.defineProperties(flattenObjectLiteral, /** @lends just.flattenObjectLiteral */{
        /**
         * Options for {@link just.flattenObjectLiteral}.
         *
         * @typedef {object} just.flattenObjectLiteral~options
         * @property {String} [separator=""] - A string to join the keys.
         */

        /**
         * Default options for {@link just.flattenObjectLiteral}.
         *
         * @type {just.flattenObjectLiteral~options}
         */
        'DEFAULT_OPTIONS': {
            'get': function () {

                return {
                    'separator': '.'
                };

            }
        }
    });

    return just.setFn('flattenObjectLiteral', flattenObjectLiteral);

});
