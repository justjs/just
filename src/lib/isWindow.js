define(['./core'], function (APR) {

	'use strict';

	return APR.setFn('isWindow',
	/**
	 * Checks if an object is a window by checking `window` or some common properties of `window`.
	 * 
	 * @function
	 * @param {*} object - Some object.
	 * @return {boolean} - `true` if `object` is `window` or has the common properties,
	 *     `false` otherwise.
	 */
	function isWindow (object) {
		return !!(
			(typeof window !== 'undefined' && object === window) ||
			object instanceof Object &&
			object.document &&
			object.setInterval
		);
	});

});