define(function () {
	
	'use strict';

	/**
	 * Checks if the screen SUPPORTS touch if no `fn` is given, otherwise it
	 * will trigger `fn` when a touch event is fired.
	 * Based on https://codeburst.io/the-only-way-to-detect-touch-with-javascript-7791a3346685?gi=5f0b293d6111
	 * @param {function} [fn] if provided, the function will trigger if a touch event is fired.
	 * @return {boolean}
	 */
	return function isTouchDevice (fn) {

		var isTouch = 'ontouchstart' in body
			|| navigator.maxTouchPoints > 0
			|| navigator.msMaxTouchPoints > 0
			|| (window.DocumentTouch
				&& document instanceof DocumentTouch);

		if (typeof fn === 'function') {

			window.addEventListener('touchstart', function listener (e) {
				fn(e);
				window.removeEventListener(e.type, listener);
			});

		}

		return isTouch;

	};

});