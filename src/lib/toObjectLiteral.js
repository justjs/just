var check = require('./check');
var deprecate = require('./deprecate');
var assign = require('./assign');

/**
 * Converts <code>[[k0, v0], {k1: v1}]</code> to <code>{k0: v0, k1: v1}</code>.
 *
 * @deprecated since 1.0.0-rc.22
 * @namespace
 * @memberof just
 * @param {!object[]|!object} array - An array containing sub-arrays
 *     with object literal pairs, or object literals: <code>[[k, v], {k: v}]</code>.
 *
 * @return {!object} An object literal.
 */
function toObjectLiteral (array) {

    var objectLiteral = {};

    deprecate('.toObjectLiteral()', 'warning', {
        'since': '1.0.0-rc.22'
    });

    if (check(array, {}, null)) {

        return assign({}, array);

    }

    if (!check(array, [])) {

        throw new TypeError(array + ' must be either null, an object literal or an Array.');

    }

    array.forEach(function (subArray) {

        var key, value;

        if (check(subArray, [])) {

            key = subArray[0];
            value = subArray[1];
            this[key] = value;

        }
        else if (check(subArray, {})) {

            assign(this, subArray);

        }
        else {

            throw new TypeError(subArray + ' must be either ' +
				'an object literal or an Array.');

        }

    }, objectLiteral);

    return objectLiteral;

}

module.exports = toObjectLiteral;
