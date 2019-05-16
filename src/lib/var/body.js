define(['../getElements'], function (getElements) {
	
	'use strict';

	/**
	 * The first body element of the current document.
	 * @type {Element}
	 * @readOnly
	 */
	return getElements('body')[0];

});