define(['./core'], function (APR) {
	
	'use strict';

	return APR.setFn('isEmptyObject',
	/**
	 * Checks if an object has no direct keys.
	 * 
	 * @function APR.isEmptyObject
	 * @param  {Object} object Some object.
	 * @return {boolean} true if it's null or not an object.
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