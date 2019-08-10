define(['./core'], function (APR) {

	'use strict';

	return APR.setFn('stringToJSON',
	/**
	 * Parses a JSON string into a JSON-like.
	 *
	 * @function APR.stringToJSON
	 * @param  {string} string Some string to parse.
	 * 
	 * @example
	 * stringToJSON('{"a": 1}'); // returns {a: 1}.
	 *
	 * @example
	 * stringToJSON(1); // returns {}.
	 * 
	 * @return {!Object} A JSON-like object.
	 */
	function stringToJSON (string) {
		
		var json;

		if (typeof string !== 'string') {
			return {};
		}

		try {
			json = JSON.parse(string) || {};
		}
		catch (exception) {
			return {};
		}

		return json;

	});

});