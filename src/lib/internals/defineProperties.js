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
var defineProperties = function defineProperties (object, properties) {

    eachProperty(properties, function (value, key) {

        defineProperty(object, key, value);

    });

    return object;

};

module.exports = defineProperties;
