define([
	'./hasOwn'
], function (hasOwn) {
	
	'use strict';

	/**
	 * Checks if an object has no direct keys.
	 * 
	 * @param  {Object} object Some object.
	 * @return {boolean} true if it's null or not an object.
	 */
	return function isEmptyObject (object) {
		
		var obj = Object(object);
		var k;

		for (k in obj) {
			if (hasOwn(obj, k)) {
				return false;
			}
		}

		return true;
	};

});