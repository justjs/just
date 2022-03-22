var reduce = require('./reduce');

/**
 * Alternative to <var>Object.defineProperty</var> with more enhancements.
 *
 * <br>
 * <aside class='note'>
 *     <h3>A few things to consider (see examples):</h3>
 *     <ul>
 *         <li>If <var>object</var> contains invalid {@link propertyDescriptor|property descriptor attributes},
 *             the value WON'T be used as a property descriptor.</li>
 *         <li>Empty objects will be considered values.</li>
 *     </ul>
 * </aside>
 *
 * @namespace
 * @memberof just
 * @throws <var>Object.defineProperty</var> exceptions.
 * @param {!object} object - The target.
 * @param {string} key - Key for the property.
 * @param {!object} [value={'value': value}] - A {@link propertyDescriptor|property descriptor} or some value.
 * @example <caption>Define a property using a value.</caption>
 * just.defineProperty({}, 'a', 1); // Same as Object.defineProperty({}, 'a', {'value': 1})
 *
 * @example <caption>Define a property using a {@link propertyDescriptor|property descriptor}.</caption>
 * just.defineProperty({}, 'a', {'writable': true}); // Same as Object.defineProperty({}, 'a', {'writable': true})
 *
 * @example <caption>Define a property with an empty object.</caption>
 * just.defineProperty({}, 'a', {}); // Same as Object.defineProperty({}, 'a', {'value': {}});
 *
 * @return <var>object</var>.
 */
function defineProperty (object, key, value) {

    var descriptor = Object(value);
    var defaultDescriptors = ['value', 'writable', 'get', 'set', 'configurable', 'enumerable'];
    var descriptorKeys = reduce(descriptor, function (keys, value, key) { return keys.concat(key); }, []);
    var isEmptyObject = !descriptorKeys.length;
    var notADescriptor = isEmptyObject || descriptorKeys.some(
        function notInDescriptors (key) { return this.indexOf(key) === -1; },
        defaultDescriptors
    );

    if (notADescriptor) {

        descriptor = {
            'value': value
        };

    }

    Object.defineProperty(object, key, descriptor);

    return object;

}

module.exports = defineProperty;
