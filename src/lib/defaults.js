var check = require('./check');
var eachProperty = require('./eachProperty');
var assign = require('./assign');

/**
 * Defaults to <var>defaultValue</var> if <var>value</var> looks like
 * <var>defaultValue</var>.
 *
 * @namespace
 * @memberof just
 * @param {*} value - Any value.
 * @param {*} [defaultValue] - A value with a desired type for <var>value</var>.
 *     If an object literal is given, all the keys of <var>value</var> will <var>default</var>
 *     to his corresponding key in this object.
 * @param {object} opts - Some options.
 * @param {boolean} [opts.ignoreDefaultKeys=false] - If `false` and <var>defaultValue</var>
 *     is an object literal, the default keys will be added to <var>value</var>
 *     or checked against this function for each repeated key.
 * @param {boolean} [opts.checkLooks=true]
 *     If `true`:
 *         `[]` will match ONLY with another Array.
 *         `{}` will match ONLY with another object literal.
 *     If `false`
 *         `[]` and `{}` will match with any other object.
 * @param {boolean} [opts.checkDeepLooks=true]
 *     Same as <var>checkLooks</var> but it works with the inner values
 *     of the objects.
 * @param {boolean} [opts.ignoreNull=false]
 *     If `true`, <var>defaultValue</var>s with null as a value won't be checked
 *     and any <var>value</var> (except `undefined`) will be allowed.
 *
 * @example
 * just.defaults([1, 2], {a: 1}); // {a: 1}
 *
 * @example
 * just.defaults({}, null); // null: null is not an object literal.
 * just.defaults([], null, {'checkLooks': false}); // []: null is an object.
 * just.defaults(null, {}); // {}: null is not an object literal.
 * just.defaults(null, []); // []: null is not an Array.
 *
 * @example
 * just.defaults(1, NaN); // 1 (NaN is an instance of a Number)
 *
 * @example
 * just.defaults({'a': 1, 'b': 2}, {'a': 'some string'}, {'ignoreDefaultKeys': false}); // {'a': 'some string', 'b': 2}
 *
 * @example
 * just.defaults({'a': 1}, {'b': 2}, {'ignoreDefaultKeys': false}); // {'a': 1, 'b': 2}
 * just.defaults({'a': 1}, {'b': 2}, {'ignoreDefaultKeys': true}); // {'a': 1}
 *
 * @example
 * just.defaults(1, null, {'ignoreNull': false}) // null (1 is not an object)
 * just.defaults(1, null, {'ignoreNull': true}) // 1
 * just.defaults(undefined, null, {'ignoreNull': true}) // null
 * just.defaults({a: 1}, {a: null}, {'ignoreNull': true}) // {a: 1}
 *
 * @returns {value} <var>value</var> if it looks like <var>defaultValue</var> or <var>defaultValue</var> otherwise.
 */
function defaults (value, defaultValue, opts) {

    var options = assign({
        'ignoreDefaultKeys': false,
        'checkLooks': true,
        'checkDeepLooks': true,
        'ignoreNull': false
    }, opts);

    if (options.ignoreNull && defaultValue === null && value !== void 0) { return value; }

    if (options.checkLooks) {

        if (!check(value, defaultValue)) { return defaultValue; }

        if (check(value, {}) && options.checkDeepLooks) {

            eachProperty(defaultValue, function (v, k) {

                if (typeof value[k] !== 'undefined') {

                    value[k] = defaults(value[k], v, options);

                }
                else if (!options.ignoreDefaultKeys) {

                    value[k] = v;

                }

            });

        }

        return value;

    }

    return (typeof value === typeof defaultValue
        ? value
        : defaultValue
    );

}

module.exports = defaults;
