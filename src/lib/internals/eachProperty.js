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
 * @namespace
 * @memberof just
 * @param {*} object - Some value.
 * @param {just.eachProperty~fn} fn - The function that will be
 *     called on each iteration.
 * @param {*} [thisArg] - <var>this</var> for <var>fn</var>.
 * @param {object} [opts={@link just.eachProperty.DEFAULT_OPTIONS}] - Some options.
 *
 * @throws {TypeError} If <var>fn</var> is not a function.
 * @return {boolean} `true` if the function was interrupted, `false` otherwise.
 */
var eachProperty = function eachProperty (object, fn, thisArg, opts) {

    var properties = Object(object);
    var options = Object.assign({}, eachProperty.DEFAULT_OPTIONS, opts);
    var wasInterrupted = false;
    var k;

    /* eslint-disable padded-blocks */
    if (typeof fn !== 'function') {
        throw new TypeError(fn + ' is not a function.');
    }
    /* eslint-enable padded-blocks */

    for (k in properties) {

        if (wasInterrupted) { break; }

        if (options.addNonOwned || ({}).hasOwnProperty.call(properties, k)) {

            wasInterrupted = !!fn.call(thisArg, properties[k], k,
                properties);

        }

    }

    return wasInterrupted;

};

module.exports = Object.defineProperties(eachProperty, /** @lends just.eachProperty */{
    /**
     * Options for {@link just.eachProperty}.
     *
     * @typedef {object} just.eachProperty~options
     * @property {boolean} [addNonOwned=false] - Include non-owned properties.
     *     `false`: iterate only the owned properties.
     *     `true`: iterate the (enumerable) inherited properties too.
     */

    /**
     * Default options for {@link just.eachProperty}.
     *
     * @type {just.eachProperty~options}
     * @readonly
     */
    'DEFAULT_OPTIONS': {
        'value': Object.freeze({
            'addNonOwned': false
        })
    }

});