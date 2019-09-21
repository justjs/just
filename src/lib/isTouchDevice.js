define(['./core'], function (just) {

    'use strict';

    /* globals DocumentTouch */

    /**
     * Checks if the screen -supports- touch.
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

    return just.setFn('isTouchDevice', isTouchDevice);

});
