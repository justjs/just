define(function () {

    'use strict';

    /**
     * Parses a JSON string into a JSON.
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
     * @return {!object} A JSON-like object.
     */
    var stringToJSON = function stringToJSON (string) {

        var json;

        if (!/\{.+\}/.test(string)) { return {}; }

        try { json = JSON.parse(string); }
        catch (exception) { return {}; }

        return json;

    };

    return stringToJSON;

});
