var deprecate = require('./deprecate');
/**
 * @typedef {function} just.eachProperty~fn
 *
 * @this {@link just.eachProperty|<var>thisArg</var> from the main function}.
 *
 * @param {*} value - The current value.
 * @param {*} key - The current key.
 * @param {!object} object - The current object being iterated.
 *
 * @return {boolean} If `true`, the current loop will stop.
 */

/**
 * Converts <var>object</var> to an Object, iterates over it,
 * calls a function on each iteration, and if a truthy value
 * is returned from that function, the loop will stop.
 *
 * @deprecated since 1.0.0-rc.22
 * @namespace
 * @memberof just
 * @param {*} object - Some value.
 * @param {just.eachProperty~fn} fn - The function that will be
 *     called on each iteration.
 * @param {*} [thisArg] - <var>this</var> for <var>fn</var>.
 * @param {object} opts - Some options.
 * @param {boolean} [opts.addNonOwned=false] - Include non-owned properties.
 *     `false`: iterate only the owned properties.
 *     `true`: iterate the (enumerable) inherited properties too.
 *
 * @throws {TypeError} If <var>fn</var> is not a function.
 * @return {boolean} `true` if the function was interrupted, `false` otherwise.
 */
function eachProperty (object, fn, thisArg, opts) {

    var properties = Object(object);
    var options = Object.assign({
        'addNonOwned': false
    }, opts);
    var wasInterrupted = false;
    var key;

    deprecate('.eachProperty()', 'warning', {
        'since': '1.0.0-rc.22',
        'message': 'Use a for in loop instead.'
    });

    if (typeof fn !== 'function') { throw new TypeError(fn + ' is not a function.'); }

    for (key in properties) {

        if (wasInterrupted) { break; }

        if (options.addNonOwned || ({}).hasOwnProperty.call(properties, key)) {

            wasInterrupted = Boolean(fn.call(thisArg, properties[key], key, properties));

        }

    }

    return wasInterrupted;

}

module.exports = eachProperty;
