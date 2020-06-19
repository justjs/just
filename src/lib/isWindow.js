var deprecate = require('./deprecate');

/**
 * Checks if an object is the window global by checking <var>window</var> or
 * some common properties of <var>window</var>.
 *
 * @namespace
 * @memberof just
 * @deprecated Since 1.0.0-rc.24
 * @param {*} object - Some object.
 * @return {boolean} `true` if <var>object</var> is <var>window</var> or contains the common properties,
 *     `false` otherwise.
 */
function isWindow (object) {

    deprecate('.isWindow()', 'warning', {
        'since': '1.0.0-rc.24'
    });

    return Boolean(object === window
        || object instanceof Object
        && object.document
        && object.setInterval
    );

}

module.exports = isWindow;
