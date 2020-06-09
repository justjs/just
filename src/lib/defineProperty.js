/**
 * Alternative to <var>Object.defineProperty</var> with more enhancements.
 *
 * If <var>object</var> contains any other key that's not a valid attribute for a
 * {@link propertyDescriptor|property descriptor} the value WON'T be used
 * as a property descriptor. I.e:
 * <code>
 * defineProperty({}, 'property', {
 *     value: 1,
 *     other: 'value'
 * }).property; // > {value: 1, other: 'value'}
 * </code>
 *
 * Note: Empty objects will be considered values rather than property descriptors.
 *
 * @namespace
 * @memberof just
 * @throws <var>Object.defineProperty</var> exceptions.
 * @param {!object} object - The target.
 * @param {string} key - Key for the property.
 * @param {!object} [value={value}] - A {@link propertyDescriptor} or some value.
 * @return <var>object</var>.
 */
function defineProperty (object, key, value) {

    var descriptor = Object(value);

    if (!defineProperty.isDescriptor(descriptor)) {

        descriptor = {
            'value': value
        };

    }

    Object.defineProperty(object, key, descriptor);

    return object;

}

Object.defineProperties(defineProperty, /** @lends just.defineProperty */{
    /**
     * Check if the given value is a {@link propertyDescriptor}.
     *
     * @since 1.0.0-rc.23
     * @function
     * @param {*} descriptor
     * @returns {boolean}
     */
    'isDescriptor': {
        'value': function isPropertyDescriptor (descriptor) {

            var keys = ['value', 'writable', 'get', 'set', 'configurable', 'enumerable'];
            var isDescriptor = keys.some(
                function (key) { return key in this; },
                Object(descriptor)
            );

            return isDescriptor;

        }
    }
});

module.exports = defineProperty;
