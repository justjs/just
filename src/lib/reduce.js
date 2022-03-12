/**
 * Same as <var>Array.prototype.reduce</var>, but for
 * the own enumerable properties of <var>object</var>,
 * and with an extra param (<var>thisArg</var>).
 *
 * <aside class='note'>
 *   <h3>A few things to consider:</h3>
 *   <p>Don't trust the order of the properties.</p>
 *   <p>Instead of using an index for the 3rd argument, we use the current <var>key</var>.</p>
 * </aside>
 *
 * @namespace
 * @memberof just
 * @param {object} object - The target object.
 * @param {function} fn - The transform function. It's called with the same arguments as the <var>Array.prototype.reduce</var> function.
 * @param {*} accumulator - The initial value for the accumulator.
 * @param {*} thisArg - <var>this</var> argument for <var>fn</var>.
 * @returns <var>accumulator</var>
 * @example <caption>Get object keys (when Object.keys is unavailable).</caption>
 * just.reduce({'a': 1}, function (keys, value, key, object) { return keys.concat(key); }, []);
 */
function reduce (object, fn, accumulator, thisArg) {

    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var target = Object(object);
    var key, value;

    for (key in target) {

        if (hasOwnProperty.call(target, key)) {

            value = target[key];
            accumulator = fn.call(thisArg, accumulator, value, key, target);

        }

    }

    return accumulator;

}

module.exports = reduce;
