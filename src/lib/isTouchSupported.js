/* global DocumentTouch */
/**
 * Checks if the screen <em>supports</em> touch.
 *
 * @namespace
 * @memberof just
 * @return {boolean}
 */
function isTouchSupported () {

    return Boolean('ontouchstart' in document.body
		|| window.navigator.maxTouchPoints > 0
		|| window.navigator.msMaxTouchPoints > 0
		|| 'DocumentTouch' in window
		&& document instanceof DocumentTouch
    );

}

module.exports = isTouchSupported;
