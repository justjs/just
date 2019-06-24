define(['./core'], function (APR) {
	
	'use strict';

	/**
	 * Gets the name of `fn` using fn.name (if supported) or a regexp.
	 * 
	 * @param  {function} fn Any function.
	 *
	 * @throws {TypeError} If `fn` is not a function.
	 *
	 * @return {string} The function name or an empty string if something fails.
	 */
	return APR.setFn('getFunctionName', function getFunctionName (fn) {

		var matches;

		if (typeof fn !== 'function') {
			throw new TypeError(fn + ' is not a function.');
		}

		if ('name' in fn) {
			return fn.name;
		}

		matches = fn.toString().match(/function([^\(]+)\(+/i);

		return matches ? matches[1].trim() : '';

	});

});