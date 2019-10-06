define(['./core'], function (just) {

    'use strict';

    /**
     * A cross-browser solution to get the pressed key on a keyboard
     * event.
     *
     * @namespace
     * @memberof just
     * @param {!Event} e - Some event.
     *
     * @example
     * document.addEventListener('keydown', function (e) {
     *     if (/(Enter|13)/.test(getPressedKey(e))) {
     *         console.log('Enter');
     *     }
     * });
     *
     * @return {number|string} Any of <var>e.key</var>, <var>e.which</var> or
     *     <var>w.keyCode</var>.
     */
    var getPressedKey = function getPressedKey (e) {

        return e.key || e.which || e.keyCode;

    };

    return just.setFn('getPressedKey', getPressedKey);

});
