define(function () {
	
	'use strict';

	/**
	 * Alias for `Object.prototype.hasOwnProperty.call` method.
	 * @param {object} Some object.
	 * @param {property} Some property.
	 * @return {boolean} 
	 */
	return function hasOwn (object, property) {
		return Object.prototype.hasOwnProperty.call(object, property);
	};

});