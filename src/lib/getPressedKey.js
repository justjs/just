define(['./core'], function (APR) {

	'use strict';

	/**
	 * A cross-browser solution to get the pressed key on a keyboard
	 * event.
	 * 
	 * @param {!Event} e Some event.
	 *
	 * @example
	 * document.addEventListener('keypress', function (e) {
	 *     if (/(Enter|13)/.test(getPressedKey(e))) {
	 *         console.log('Enter');
	 *     }
	 * });
	 *
	 * @return {number|string} Any of e.key, e.code, e.which or w.keyCode
	 */
	return APR.setFn('getPressedKey', function getPressedKey (e) {
		return e.key || e.code || e.which || e.keyCode;
	});

});