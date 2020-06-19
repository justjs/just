var defineProperty = require('./defineProperty');
var eachProperty = require('./eachProperty');

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

    eachProperty(properties, function define (value, key) {

        defineProperty(this, key, value);

    }, object);

    return object;

}

module.exports = defineProperties;
