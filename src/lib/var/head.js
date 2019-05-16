define(['../getElements'], function (getElements) {

	'use strict';

	/**
	 * The first head element of the current document.
	 * @type {Element}
	 * @readOnly
	 */
	return getElements('head')[0];

});