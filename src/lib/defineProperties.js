var defineProperty = require('./defineProperty');

/**
 * Alternative to <var>Object.defineProperties</var>.
 *
 * @see {@link defineProperty} for more details.
 * @namespace
 * @memberof just
 * @param {!object} object
 * @param {!object.<key, propertyDescriptor>|!object.<key, value>} properties
 * @return <var>object</var>
 */
function defineProperties (object, properties) {

    var key, value;

    for (key in properties) {

        if (({}).hasOwnProperty.call(properties, key)) {

            value = properties[key];
            defineProperty(object, key, value);

        }

    }

    return object;

}

module.exports = defineProperties;
