define(['./core', './defaults'], function (just, defaults) {

    'use strict';

    /**
     * Flattens an array of arrays.
     *
     * @namespace
     * @memberof just
     * @param {*} [value=[value]] - The target.
     * @param {Number} [maxLevel=-1] - Maximum deep-level to flatten.
     *
     * @example
     * flattenArray([0, [1, [2]]]); // [0, 1, 2]
     *
     * @example <caption>Using `maxLevel`</caption>
     * var arrayLike = {'0': [0, [1, [2]]]};
     * var array = Array.from(arrayLike);
     * var maxLevel = 1;
     *
     * flattenArray(array, maxLevel) // [0, 1, [2]]
     *
     * @return {!Array} The flattened array.
     */
    var flattenArray = function flattenArray (value, maxLevel) {

        var array = defaults(value, [value]);
        var flattened = [];

        maxLevel = defaults(maxLevel, -1);

        /* eslint-disable padded-blocks */
        if (maxLevel === 0) {
            return array;
        }
        /* eslint-enable padded-blocks */

        [].forEach.call(array, function (value) {

            flattened = flattened.concat(Array.isArray(value) && maxLevel !== 0
                ? flattenArray(value, maxLevel - 1)
                : value
            );

        });

        return flattened;

    };

    return just.setFn('flattenArray', flattenArray);

});
