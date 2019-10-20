var defineProperties = require('./defineProperties');
var eachProperty = require('./eachProperty');
var defaults = require('./defaults');

/**
 * A mixin of properties that access to some kind of storage
 * in the browser.
 *
 * @class
 * @memberof just
 * @param {boolean} [consent=false] - A boolean indicating that
 *     the user allowed the access to some kind of local storage.
 * @param {boolean} [isExplicit=typeof consent !== 'undefined'] -
 *     A value to indicate if the given consent was specified by the
 *     user.
 */
function LocalStorage (consent, isExplicit) {

    /* eslint-disable padded-blocks */
    if (!(this instanceof LocalStorage)) {
        return new LocalStorage(consent, isExplicit);
    }
    /* eslint-enable padded-blocks */

    defineProperties(this, {
        'consent': !!consent,
        'isExplicit': defaults(isExplicit, typeof consent !== 'undefined')
    });

}

defineProperties(LocalStorage, /** @lends just.LocalStorage */{
    /**
     * The DoNotTrack header formatted as `true`, `false` or `undefined`
     * (for "unspecified").
     *
     * @static
     * @type {boolean|undefined}
     */
    'DNT': {
        'get': function DNT () {

            var dnt = [
                navigator.doNotTrack, navigator.msDoNotTrack, window.doNotTrack
            ];
            var consent = ',' + dnt + ',';

            return (/,(yes|1),/i.test(consent)
                ? true
                : /,(no|0),/i.test(consent)
                ? false
                : void 0
            );

        }
    },

    /**
     * Checks if <var>cookie</var> is in <var>document.cookie</var>.
     *
     * @function
     * @static
     * @param {string} cookie - The name of the cookie or the cookie itself.
     *
     * @example
     * document.cookie += 'a=b; c=d;';
     * cookieExists('a'); // true
     * cookieExists('b'); // false
     * cookieExists('a=b'); // true
     * cookieExists('a=d'); // false
     *
     * @return {boolean} `true` if it exists, `false` otherwise.
     * @readOnly
     */
    'cookieExists': function cookieExists (cookie) {

        return new RegExp('; ' + cookie + '(=|;)').test('; ' + document.cookie + ';');

    },

    /**
     * Returns a cookie from <var>document.cookie</var>.
     *
     * @function
     * @static
     * @param {string} name - The cookie name.
     *
     * @return {string|null} The cookie if it exists or null.
     * @readOnly
     */
    'getCookie': function getCookie (name) {

        return (!/=/.test(name) && LocalStorage.cookieExists(name)
            ? ('; ' + document.cookie).split('; ' + name + '=').pop().split(';')[0]
            : null
        );

    }
});

defineProperties(LocalStorage.prototype, /** @lends just.LocalStorage.prototype */{
    /**
     * Concatenates a value to <var>document.cookie</var>.
     *
     * @function
     * @param {string} name - The name of the cookie.
     * @param {string} value - The value of the cookie.
     * @param {!object} [opts] - Cookie options.
     * @param {string} [opts.secure=location.protocol === 'https:'] - "secure" flag for the cookie.
     *
     * @return {boolean} `true` if was set, `false` otherwise.
     * @readOnly
     */
    'setCookie': function setCookie (name, value, opts) {

        var cookie = '';
        var set = function (k, v) {

            cookie += k + (typeof v !== 'undefined' ? '=' + v : '') + '; ';

        };
        var options = defaults(opts, {
            'secure': location.protocol === 'https:'
        });

        if (!this.consent) { return false; }

        if (options.secure) { set('secure'); }
        delete options.secure;

        if (options.expires) { options.expires = new Date(options.expires).toGMTString(); }

        set(name, value);
        eachProperty(options, function (v, k) { set(k, v); });

        document.cookie = cookie.trim();

        return true;

    },

    /**
     * Overrides a cookie by setting an empty value and expiring it.
     *
     * @function
     * @param {string} name - The name of the cookie.
     * @param {object} [opts] - Some extra options.
     * @param {Date} [opts.expires=new Date(0)] - A date in the past.
     *
     * @return {boolean} `true` if was overriden or the cookie
     *     does not exist, `false` otherwise.
     */
    'removeCookie': function removeCookie (name, opts) {

        var options = defaults(opts, {
            'expires': new Date(0)
        });

        if (!LocalStorage.cookieExists(name)) { return true; }

        return this.setCookie(name, '', options);

    },

    /**
     * Any of "cookie", "localStorage", "sessionStorage"...
     *
     * @typedef {string} just.LocalStorage~isStorageAvailable_type
     */

    /**
     * Tests if the specified storage does not throw.
     *
     * @function
     * @param {just.LocalStorage~isStorageAvailable_type} type
     *     A type of storage.
     * @param {string} [tempKey='_'] - Storage will save this key with <var>tempValue</var> as a value.
     * @param {string} [tempValue='_'] - Storage will save this value with <var>tempKey</var> as a key.
     *
     * @return {boolean} `true` if the function does not throw
     *     and is allowed by the user, `false` otherwise.
     */
    'isStorageAvailable': function isStorageAvailable (type, tempKey, tempValue) {

        var k = defaults(tempKey, '_');
        var v = defaults(tempValue, '_');
        var storage;

        if (!this.consent) { return false; }

        if (/cookie/i.test(type)) {

            return this.setCookie(k, v)
                && LocalStorage.getCookie(k) === v
                && this.removeCookie(k);

        }

        try {

            storage = window[type];
            storage.setItem(k, v);
            storage.removeItem(k);

        }
        catch (exception) {

            try { storage.removeItem(k); }
            catch (wrongImplementation) { return false; }

            return false;

        }

        return true;

    }
});

module.exports = LocalStorage;
