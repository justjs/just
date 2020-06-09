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
 * @param {?object} [commonDescriptor] - Since 1.0.0-rc.23. A common {@link propertyDescriptor} for each given value.
 * @return <var>object</var>
 */
function defineProperties (object, properties, commonDescriptor) {

    eachProperty(properties, function (value, key) {

        var descriptor = defineProperty.toDescriptor(value);

        Object.assign(descriptor, commonDescriptor);
        defineProperty(object, key, descriptor);

    });

    return object;

}

module.exports = defineProperties;
