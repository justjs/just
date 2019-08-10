define(['./core'], function (APR) {
	
	'use strict';

	return APR.setFn('isTouchDevice',
	/**
	 * Checks if the screen -supports- touch.
	 * @see {@link https://codeburst.io/the-only-way-to-detect-touch-with-javascript-7791a3346685?gi=5f0b293d6111|Based on this reading.}
	 *
	 * @function APR.isTouchDevice
	 * @return {boolean}
	 */
	function isTouchDevice () {

		return !!('ontouchstart' in document.body ||
			navigator.maxTouchPoints > 0 ||
			navigator.msMaxTouchPoints > 0 ||
			window.DocumentTouch &&
			document instanceof DocumentTouch
		);

	});

});