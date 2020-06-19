var parseJSON = require('./parseJSON');

/**
 * Parses an stringified JSON (<code>'{"a": 1}'</code>)
 * into an object literal (<code>{a: 1}</code>).
 * If you need to parse any other value, use {@link just.parseJSON} instead.
 *
 * @namespace
 * @memberof just
 * @param {*} string - Some string to parse.
 *
 * @example
 * stringToJSON('{"a": 1}'); // returns {a: 1}.
 *
 * @example
 * stringToJSON(1); // returns {}.
 *
 * @return {!object} An object literal.
 */
function stringToJSON (string) {

    var json;

    if (!/(?:^\{|\}$)/.test(String(string).trim())) { return {}; }

    json = parseJSON(string) || {};

    return json;

}

module.exports = stringToJSON;
