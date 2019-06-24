define(['./core'], function (APR) {

	'use strict';

	/**
	 * Checks if an object is a window by checking `window` or some common properties of `window`.
	 * 
	 * @param  {Object}  object Some object.
	 *
	 * @return {boolean} true if `object` is `window` or has the common properties, false otherwise.
	 */
	return APR.setFn('isWindow', function isWindow (object) {
		return !!(
			(typeof window !== 'undefined' && object === window) ||
			object instanceof Object &&
			object.document &&
			object.setInterval
		);
	});

});