define(['./core'], function (just) {

    'use strict';

    /**
     * Checks if an object is a window by checking `window` or some common properties of `window`.
     *
     * @namespace
     * @memberof just
     * @param {*} object - Some object.
     * @return {boolean} `true` if `object` is `window` or has the common properties,
     *     `false` otherwise.
     */
    var isWindow = function isWindow (object) {

        return !!(object === window
			|| object instanceof Object
			&& object.document
			&& object.setInterval
        );

    };

    return just.setFn('isWindow', isWindow);

});
