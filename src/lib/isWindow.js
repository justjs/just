define([
	'./isKeyValueObject'
], function (isKeyValueObject) {

	'use strict';

	/**
	 * Checks if an object is a window by checking `window` or some common properties of `window`.
	 * 
	 * @param  {Object}  object Some object.
	 * @return {boolean} true if `object` is `window` or has the common properties, false otherwise.
	 */
	return function isWindow (object) {
		return object === window || isKeyValueObject(object) && object.document && object.setInterval;
	};

});