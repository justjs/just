define(['./core'], function (APR) {
	
	'use strict';

	/**
	 * Checks if the screen -supports- touch.
	 * Based on https://codeburst.io/the-only-way-to-detect-touch-with-javascript-7791a3346685?gi=5f0b293d6111
	 *
	 * @return {boolean}
	 */
	return APR.setFn('isTouchDevice', function isTouchDevice () {

		return !!('ontouchstart' in document.body ||
			navigator.maxTouchPoints > 0 ||
			navigator.msMaxTouchPoints > 0 ||
			window.DocumentTouch &&
			document instanceof DocumentTouch
		);

	});

});