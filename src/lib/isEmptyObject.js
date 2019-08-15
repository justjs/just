define(['./core'], function (APR) {
	
	'use strict';

	/**
	 * Checks if an object has no direct keys.
	 * 
	 * @namespace
	 * @memberof APR
	 * @param {*} [object=Object(object)] - Some object.
	 * @return {boolean} `true` if the object doesn't contain owned properties,
	 *     `false` otherwise.
	 */
	var isEmptyObject = function (object) {
		
		var obj = Object(object);
		var k;

		for (k in obj) {
			
			if (({}).hasOwnProperty.call(obj, k)) {
				return false;
			}

		}

		return true;

	};

	return APR.setFn('isEmptyObject', isEmptyObject);

});