define(['./var/body'], function (body) {
	
	'use strict';

	/**
	 * Checks if the screen -supports- touch.
	 * will trigger `fn` when a touch event is fired.
	 * Based on https://codeburst.io/the-only-way-to-detect-touch-with-javascript-7791a3346685?gi=5f0b293d6111
	 * @return {boolean}
	 */
	return function isTouchDevice (fn) {

		var isTouch = 'ontouchstart' in body
			|| navigator.maxTouchPoints > 0
			|| navigator.msMaxTouchPoints > 0
			|| !!(window.DocumentTouch
				&& document instanceof DocumentTouch);

		return isTouch;

	};

});