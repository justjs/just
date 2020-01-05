/**
 * The given object (if <var>mutate</var> evals to `true`)
 * or a copy of each own property of the given object.
 *
 * @typedef {!object} just.access~handler_this
 */

/**
 * A function to call when {@link just.access} reaches the deep property of an object.
 *
 * @typedef {function} just.access~handler
 * @this just.access~handler_this
 * @param {!object} lastObject - The object containing the <var>lastKey</var>.
 * @param {string} lastKey - The last value given in <var>path</var>.
 * @param {boolean} hasProperty - `false` if some key of <var>path</var>
 *     was created, `true` otherwise.
 * @param {string[]} path - The given keys.
 * @return {*} The return value for {@link just.access|the main function}.
 */

/**
 * Accesses to a deep property in a new <var>object</var>
 * (or <var>object</var> if <var>mutate</var> evals to `true`).
 *
 * @namespace
 * @memberof just
 * @param {!object} object - The base object.
 * @param {string[]} [path=[path]] - The ordered keys.
 * @param {just.access~handler} [handler=returnValue] - A custom function.
 * @param {object} opts
 * @param {boolean} [opts.mutate=false] - If `true`, it will use
 *     the given object as the base object, otherwise it will
 *     copy all the owned properties to a new object.
 * @param {boolean} [opts.override=true] - If `true`, and the
 *     current value is different to `null` or `undefined`,
 *     the function will throw a TypeError.
 *     If `false`, the current value will be overriden by
 *     an empty object if it's not an object nor `undefined`.
 *
 * @throws {TypeError} If some property causes access problems.
 *
 * @example <caption>Accessing to some existent property</caption>
 * access({a: {b: {c: {d: 4}}}}, ['a', 'b', 'c', 'd'], function (currentObject, currentKey, hasProperty, path) {
 *     return hasProperty ? currentObject[currentKey] : null;
 * }); // returns 4.
 *
 * @example <caption>Accessing to some property with a non-JSON-like-object as a value</caption>
 * access({a: 1}, ['a', 'b', 'c']); // throws TypeError.
 * access({a: 1}, ['a', 'b', 'c'], null, {
 *     'override': true
 * }); // returns undefined.
 * // Doesn't throw because it replaces `1` with an empty object
 * // and keeps accessing to the next properties.
 *
 * @example <caption>Accessing to some non-existent property</caption>
 * var obj = {z: 1, prototype: [...]};
 * var newObj = access(obj, 'a.b.c'.split('.'), function (currentObject, currentKey, hasProperty, path) {
 *
 *     if (!hasProperty) {
 *         currentObject[currentKey] = path.length;
 *     }
 *
 *     // At this point:
 *     //     `obj` is {z: 1},
 *     //     `currentObject` has a value in `currentKey`,
 *     //     and `this` has all the added keys (even the ones modified in `currentObject`).
 *     return this;
 *
 * }); // returns {z: 1, a: {b: {c: 3}}}
 *
 * // if you want the prototype chain of obj, just copy it.
 * Object.assign(newObj.prototype, obj.prototype);
 *
 * @example <caption>Modifying the base object</caption>
 * var obj = {a: {b: false}, b: {b: false}, prototype: [...]};
 *
 * access(obj, 'a.b'.split('.'), function (currentObject, currentKey, hasProperty, path) {
 *     currentObject[currentKey] = 2;
 * }, true);
 *
 * // now `obj` is {a: {a: true}, b: {b: true}, prototype: [...]}.
 *
 * @return {*} If <var>handler</var> is given: the returned value of that function,
 *         otherwise: the last value of <var>path</var> in the copied object.
 */
function access (object, path, handler, opts) {

    var options = Object.assign({
        'override': true,
        'mutate': false
    }, opts);
    var properties = (Array.isArray(path)
        ? path
        : [path]
    );
    var initialObject = (options.mutate
        ? object
        : Object.assign({}, object)
    );
    var currentObject = initialObject;
    var isNewProperty = false;
    var lastKey = properties[properties.length - 1];
    var hasProperty;

    properties.slice(0, -1).forEach(function (key, i) {

        var value = currentObject[key];

        if (!(value instanceof Object)) {

            if (typeof value !== 'undefined' && value !== null && !options.override) {

                throw new TypeError(key + ' is not an object.');

            }

            isNewProperty = true;
            currentObject[key] = value = {};

        }

        currentObject = value;

    });

    hasProperty = lastKey in currentObject && !isNewProperty;

    return (handler
        ? handler.call(initialObject, currentObject, lastKey, hasProperty, properties)
        : currentObject[lastKey]
    );

}

module.exports = access;
