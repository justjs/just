var hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Same as <var>Object.assign</var>, but for ES5 environments.<br>
 *
 * <aside class='note'>
 *   <h3>A few things to consider</h3>
 *   <p>This is most likely to be removed in the future, if we
 *   decide to transpile our code and use the spread sintax instead.</p>
 *   <p>This will be used internally, instead of <var>Object.assign</var>,
 *   to prevent users from loading a polyfill. So, it's most likely
 *   that it will be included in your final bundle.</p>
 * </aside>
 *
 * @namespace
 * @memberof just
 * @param {object} target - What to apply the sources' properties to.
 * @param {?object} [...sources] - Objects containing the properties you want to apply.
 * @throws if <var>target</var> is null or not an object.
 * @returns {object} <var>target</var>.
 */
function assign (target/*, ...sources */) {

    'use strict'; // Make non writable properties throwable.

    var to, i, f, from, key;

    if (target === null || target === void 0) {

        throw new TypeError('can\'t convert ' + target + ' to object');

    }

    to = Object(target);

    for (i = 1, f = arguments.length; i < f; i++) {

        from = Object(arguments[i]);

        for (key in from) {

            if (hasOwnProperty.call(from, key)) {

                to[key] = from[key];

            }


        }

    }

    return to;

}

module.exports = assign;
