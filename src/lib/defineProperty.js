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
    var defaultAttributes = Object.assign(Object.getOwnPropertyDescriptor(
        Object.defineProperty({}, '_', {}), '_'
    ), {
        'get': void 0,
        'set': void 0
    });

    if ((value || {}).constructor !== ({}).constructor || !Object.keys(defaultAttributes).some(
        function (key) { return key in descriptor; }
    ) || !Object.keys(descriptor).every(
        function (key) { return key in defaultAttributes; }
    )) {

        descriptor = {
            'value': value
        };

    }

    Object.defineProperty(object, key, descriptor);

    return object;

}

module.exports = defineProperty;
