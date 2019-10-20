var eachProperty = require('./eachProperty');

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

    return !eachProperty(object, function () { return true; });

}

module.exports = isEmptyObject;
