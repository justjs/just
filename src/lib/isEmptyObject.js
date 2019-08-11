define(['./core'], function (APR) {
	
	'use strict';

	return APR.setFn('isEmptyObject', /** @lends APR */
	/**
	 * Checks if an object has no direct keys.
	 * 
	 * @function
	 * @param {*} [object=Object(object)] - Some object.
	 * @return {boolean} - `true` if the object doesn't contain owned properties,
	 *     `false` otherwise.
	 */
	function isEmptyObject (object) {
		
		var obj = Object(object);
		var k;

		for (k in obj) {
			
			if (({}).hasOwnProperty.call(obj, k)) {
				return false;
			}

		}

		return true;

	});

});