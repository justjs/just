define(['./core', './check'], function (just, check) {

    'use strict';

    /**
     * Converts <code>[[k0, v0], {k1: v1}]</code> to <code>{k0: v0, k1: v1}</code>.
     *
     * @namespace
     * @memberof just
     * @param {!object[]|!object} array - An array containing sub-arrays
     *     with object literal pairs, or object literals: <code>[[k, v], {k: v}]</code>.
     *
     * @return {!object} An object literal.
     */
    var toObjectLiteral = function toObjectLiteral (array) {

        var objectLiteral = {};

        /* eslint-disable padded-blocks */
        if (check(array, {}, null)) {
            return Object.assign({}, array);
        }

        if (!check(array, [])) {
            throw new TypeError(array + ' must be either ' +
				'null, an object literal or an Array.');
        }
        /* eslint-enable padded-blocks */

        array.forEach(function (subArray) {

            var key,
                value;

            if (check(subArray, [])) {

                key = subArray[0];
                value = subArray[1];
                this[key] = value;

            }
            else if (check(subArray, {})) {

                Object.assign(this, subArray);

            }
            else {

                throw new TypeError(subArray + ' must be either ' +
					'an object literal or an Array.');

            }

        }, objectLiteral);

        return objectLiteral;

    };

    return just.setFn('toObjectLiteral', toObjectLiteral);

});
