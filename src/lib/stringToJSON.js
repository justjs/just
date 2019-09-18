define(['./core'], function (APR) {

    'use strict';

    /**
	 * Parses a JSON string into a JSON.
	 *
	 * @namespace
	 * @memberof APR
	 * @param {*} string - Some string to parse.
	 *
	 * @example
	 * stringToJSON('{"a": 1}'); // returns {a: 1}.
	 *
	 * @example
	 * stringToJSON(1); // returns {}.
	 *
	 * @return {!object} A JSON-like object.
	 */
    var stringToJSON = function stringToJSON (string) {

        var json;

        /* eslint-disable padded-blocks */
        if (!/\{.+\}/.test(string)) {
            return {};
        }
        /* eslint-enable padded-blocks */

        try {

            json = JSON.parse(string);

        }
        catch (exception) {

            return {};

        }

        return json;

    };

    return APR.setFn('stringToJSON', stringToJSON);

});
