/* global DocumentTouch */
var just = require('./core');
/**
 * Checks if the screen <em>supports</em> touch.
 *
 * @namespace
 * @memberof just
 * @return {boolean}
 */
var isTouchSupported = function isTouchSupported () {

    return !!('ontouchstart' in document.body
		|| window.navigator.maxTouchPoints > 0
		|| window.navigator.msMaxTouchPoints > 0
		|| 'DocumentTouch' in window
		&& document instanceof DocumentTouch
    );

};

module.exports = just.register({'isTouchSupported': isTouchSupported}).isTouchSupported;
