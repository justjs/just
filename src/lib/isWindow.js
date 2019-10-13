define(function () {

    'use strict';

    /**
     * Checks if an object is the window global by checking <var>window</var> or
     * some common properties of <var>window</var>.
     *
     * @namespace
     * @memberof just
     * @param {*} object - Some object.
     * @return {boolean} `true` if <var>object</var> is <var>window</var> or contains the common properties,
     *     `false` otherwise.
     */
    var isWindow = function isWindow (object) {

        return !!(object === window
			|| object instanceof Object
			&& object.document
			&& object.setInterval
        );

    };

    return isWindow;

});
