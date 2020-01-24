var defineProperties = require('./defineProperties');

/**
 * <var>this</var> for {@link just.then~wrapper}.
 *
 * @typedef {*} just.then~wrapper_this
 */

/**
 * A wrapper for the asynchronous function.
 *
 * @param {...*} arguments
 * @this just.then~wrapper_this
 * @typedef {function} just.then~wrapper
 */

/**
 * Function to call on success.
 *
 * @param {...*} arguments - The arguments passed to {@link just.then~wrapper}.
 * @this just.then~wrapper_this
 * @typedef {function} just.then~resolve
 */

/**
 * Function to call on error.
 *
 * @param {Error} exception - The exception triggered by {@link just.then~resolve}.
 * @this just.then~wrapper_this
 * @typedef {function} just.then~reject
 */

/**
 * Call a function asynchronously using any of the following:
 * Promises, setImmediate, requestAnimationFrame or setTimeout.
 *
 * @namespace
 * @memberof just
 * @param {just.then~resolve} resolve - Function to call on success.
 * @param {just.then~reject} [reject=noop] - Function to call on error.
 * @return {just.then~wrapper} A wrapper for the asynchronous function.
 */
function then (resolve, reject) {

    if (typeof reject !== 'function') { reject = function noop () {}; }

    return function () {

        var that = this;
        var args = [].slice.call(arguments);
        var callAsync = function () {

            try { resolve.apply(that, args); }
            catch (e) { reject.call(that, e); }

        };

        if ('Promise' in window) { window.Promise.resolve().then(callAsync); }
        else if ('setImmediate' in window) { setImmediate(callAsync); }
        else if ('requestAnimationFrame' in window) { requestAnimationFrame(callAsync); }
        else { setTimeout(callAsync); }

    };

}

defineProperties(then, /** @lends just.then */{

    /**
     * Limit the amount of calls to a function, asynchronously.
     *
     * @function
     * @this just.then~this
     * @param {just.then~resolve} resolve
     * @param {just.then~reject} reject
     * @returns {just.then~wrapper}
     */
    'throttle': function throttle (resolve, reject) {

        return function () {

            if (resolve.throttling) { return; }

            then(function (args) {

                resolve.apply(this, args);
                delete resolve.throttling;

            }, reject).call(this, [].slice.call(arguments));

            resolve.throttling = true;

        };

    }

});

module.exports = then;
