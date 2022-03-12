var hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Same as <var>Object.assign</var>, but without ES6+ support.
 *
 * <aside class='note'>
 *   <h3>A few things to consider</h3>
 *   <p>This is most likely to be removed in the future, if we
 *   decide to transpile our code and use the spread sintax instead.</p>
 *   <p>This will be used internally, instead of Object.assign,
 *   to prevent users from loading a polyfill. So, it's most likely
 *   that it will be included in your final bundle.</p>
 * </aside>
 *
 * @namespace
 * @memberof just
 * @param {object} target - What to apply the sources' properties to.
 * @param {...object} sources - Objects containing the properties you want to apply.
 * @throws if <var>target</var> is null or not an object.
 * @returns {object} <var>target</var>.
 */
function assign (target/*, ...sources */) {

    var sources = [].slice.call(arguments).slice(1);
    var i, f, key, sourceObj;

    if (typeof target !== 'object' || target === null) {

        throw new TypeError('can\'t convert ' + target + ' to object');

    }

    for (i = 0, f = sources.length; i < f; i++) {

        sourceObj = Object(sources[i]);

        for (key in sourceObj) {

            if (hasOwnProperty.call(sourceObj, key)) {

                target[key] = sourceObj[key];

            }

        }

    }

    return target;

}

module.exports = assign;
