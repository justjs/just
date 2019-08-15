define(['./core'], function (APR) {
	
	'use strict';

	/**
	 * Checks if the screen -supports- touch.
	 *
	 * @namespace
	 * @memberof APR
	 * @return {boolean}
	 */
	var isTouchDevice = function isTouchDevice () {

		return !!('ontouchstart' in document.body ||
			window.navigator.maxTouchPoints > 0 ||
			window.navigator.msMaxTouchPoints > 0 ||
			'DocumentTouch' in window &&
			document instanceof DocumentTouch
		);

	};

	return APR.fn.isTouchDevice = isTouchDevice;

});