define([
    './flattenObjectLiteral',
    './flattenArray',
    './check'
], function (
    flattenObjectLiteral,
    flattenArray,
    check
) {

    'use strict';

    /**
     * A factory for the "flatten..." alternatives.
     *
     * @namespace
     * @memberof just
     * @param {...*} value - Arguments for {@link just.flattenArray}
     *     if the first argument is an Array, or arguments for
     *     {@link just.flattenObjectLiteral}.
     * @throws {TypeError} If the value couldn't be flattened.
     * @return {Array|!object} The flattened value.
     */
    var flatten = function flatten (value) {

        var args = [].slice.call(arguments);
        var flattened;

        if (check(value, {})) { flattened = flattenObjectLiteral.apply(this, args); }
        else if (check(value, [])) { flattened = flattenArray.apply(this, args); }
        else { throw new TypeError(value + ' couldn\'t be flattened.'); }

        return flattened;

    };

    return flatten;

});
