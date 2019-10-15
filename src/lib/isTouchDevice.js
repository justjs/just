/* global DocumentTouch */
var just = require('./core');
/**
 * Checks if the screen <em>supports</em> touch.
 *
 * @namespace
 * @memberof just
 * @return {boolean}
 */
var isTouchDevice = function isTouchDevice () {

    return !!('ontouchstart' in document.body
		|| window.navigator.maxTouchPoints > 0
		|| window.navigator.msMaxTouchPoints > 0
		|| 'DocumentTouch' in window
		&& document instanceof DocumentTouch
    );

};

just.register({'isTouchDevice': isTouchDevice});

module.exports = isTouchDevice;
