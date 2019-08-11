define(['./core'], function (APR) {
	
	'use strict';

	return APR.setFn('isTouchDevice', /** @lends APR */
	/**
	 * Checks if the screen -supports- touch.
	 * @see {@url https://codeburst.io/the-only-way-to-detect-touch-with-javascript-7791a3346685?gi=5f0b293d6111|Based on this reading.}
	 *
	 * @function
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