define(function () {

    /**
     * Converts or wraps any value into an array.
     * Extends the functionality of <var>Array.from</var> by wrapping
     * non-object values in an array.
     *
     * @example
     * toArray('string'); // > ['string']
     * toArray(1); // > [1]
     * toArray({}); // > []
     * toArray({0: 'a', 1: 'b'}); // > ['a', 'b']
     * toArray({b: 1, a: 0}); // > ['a', 'b']
     * toArray({0: 'a', length: 1}); // > ['a']
     *
     * @param {*} value - Any value.
     * @param {function} map - Map function.
     * @param {*} thisArg - <var>this</var> for <var>fn</var>.
     * @return {Array} The converted value or a value wrapped by an array.
     */
    var toArray = function toArray (value, map, thisArg) {

        var array = [value];

        if (value instanceof Object) {

            if ('length' in value) { return Array.from(value, map, thisArg); }

            array = Object.keys(value).sort().map(function (key) { return value[key]; });

        }

        if (typeof map === 'function') { return array.map(map, thisArg); }

        return array;

    };

    return toArray;

});
