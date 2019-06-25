define(['./body'], function (body) {

	'use strict';

	/**
	 * The html element of the current document.
	 * @type {Element}
	 * @readOnly
	 */
	return document.documentElement || body.parentNode;

});