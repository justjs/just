/**
 * If <var>value</var> is an object, return <var>value</var>,
 * otherwise parse <var>value</var> using JSON.parse().
 * Return null if an exception occurs.
 *
 * @since 1.0.0-rc.23
 * @namespace
 * @memberof just
 * @param {*} value - Some value.
 *
 * @example
 * parseJSON('{"a": 1}'); // > {a: 1}
 *
 * @example
 * parseJSON('[]'); // > []
 *
 * @example
 * parseJSON(''); // > null
 *
 * @example
 * parseJSON({}); // > null
 *
 * @example
 * parseJSON(1); // > 1
 *
 * @return {*} The given value (if it's an object), the parsed value or null.
 */
function parseJSON (value) {

    var parsedValue;

    if (typeof value === 'object') { return value; }

    try { parsedValue = JSON.parse(value); }
    catch (exception) { parsedValue = null; }

    return parsedValue;

}

module.exports = parseJSON;
