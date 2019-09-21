define(['./core', './defaults'], function (just, defaults) {

    'use strict';

    /**
     * @typedef {function} just.eachProperty~fn
     *
     * @this thisArg from {@link just.eachProperty|the main function}.
     *
     * @param {*} value - The current value.
     * @param {*} key - The current key.
     * @param {!object} object - The current object being iterated.
     *
     * @return {boolean} If `true`, the current loop will stop.
     */

    /**
     * Converts `object` to an Object, iterates over it,
     * calls a function on each iteration, and if a truthy value
     * is returned from that function, the loop will stop.
     *
     * @namespace
     * @memberof just
     * @param {*} object - Some value.
     * @param {just.eachProperty~fn} fn - The function that will be
     *     called on each iteration.
     * @param {*} [thisArg] - `this` for `fn`.
     * @param {object} [opts={@link just.eachProperty.DEFAULT_OPTIONS}] - Some options.
     *
     * @throws {TypeError} If `fn` is not a function.
     * @return {boolean} `true` if the function was interrupted, `false` otherwise.
     */
    var eachProperty = function eachProperty (object, fn, thisArg, opts) {

        var properties = Object(object);
        var options = defaults(opts, eachProperty.DEFAULT_OPTIONS);
        var wasInterrupted = false;
        var k;

        /* eslint-disable padded-blocks */
        if (typeof fn !== 'function') {
            throw new TypeError(fn + ' is not a function.');
        }
        /* eslint-enable padded-blocks */

        for (k in properties) {

            /* eslint-disable padded-blocks */
            if (wasInterrupted) {
                break;
            }
            /* eslint-enable padded-blocks */

            if (options.addNonOwned
                || ({}).hasOwnProperty.call(properties, k)) {

                wasInterrupted = !!fn.call(thisArg, properties[k], k,
                    properties);

            }

        }

        return wasInterrupted;

    };

    Object.defineProperties(eachProperty, /** @lends just.eachProperty */{
        /**
         * Options for {@link just.eachProperty}.
         *
         * @typedef {object} just.eachProperty~options
         * @property {boolean} [addNonOwned=false] - Include non-owned properties.
         *     `false`: iterate only the owned properties.
         *     `true`: iterate the (enumerable) inherited properties too.
         */

        /**
         * Default options for {@link just.eachProperty}.
         *
         * @type {just.eachProperty~options}
         * @readonly
         */
        'DEFAULT_OPTIONS': {
            'get': function () {

                return {
                    'addNonOwned': false
                };

            }
        }

    });

    return just.setFn('eachProperty', eachProperty);

});
