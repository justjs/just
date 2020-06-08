/**
 * Checks if an object has no direct keys.
 *
 * @namespace
 * @memberof just
 * @param {*} [object=Object(object)] - Some object.
 * @return {boolean} `true` if the object doesn't contain owned properties,
 *     `false` otherwise.
 */
function isEmptyObject (object) {

    var obj = Object(object);
    var key;

    for (key in obj) {

        if (({}).hasOwnProperty.call(obj, key)) { return false; }

    }

    return true;

}

module.exports = isEmptyObject;
