var just = require('./core');
/**
 * Checks if an object has no direct keys.
 *
 * @namespace
 * @memberof just
 * @param {*} [object=Object(object)] - Some object.
 * @return {boolean} `true` if the object doesn't contain owned properties,
 *     `false` otherwise.
 */
var isEmptyObject = function (object) {

    var obj = Object(object);
    var k;

    for (k in obj) {

        /* istanbul ignore else */
        if (({}).hasOwnProperty.call(obj, k)) { return false; }

    }

    return true;

};

just.register({'isEmptyObject': isEmptyObject});

module.exports = isEmptyObject;
