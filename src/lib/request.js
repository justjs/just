var defaults = require('./defaults');
var parseUrl = require('./parseUrl');
var defineProperties = require('./defineProperties');

/**
 * A function to intercept and send the request.
 *
 * @this {XMLHttpRequest}
 * @param {*} data - The data ready to be sent.
 * @param {!object} options - The options for the request.
 * @typedef {function} just.request~send
 */
/**
 * Make a request using XMLHttpRequest.
 *
 * @namespace
 * @memberof just
 * @param {!string} url - Some url.
 * @param {!function} fn - Hook for error/load listener.
 * @param {?object} options
 * @param {?string} [options.method="GET"] - Method for the request.
 * @param {?boolean} [options.json=/.json$/.test(url)] - .
 * @param {*} [options.data=null] - Data to send.
 * @param {?function} [send=just.request~send] - A custom function to intercept and send the request.
 */
function request (url, fn, options) {

    var opts = defaults(options, {
        'json': /\.json$/i.test(url),
        'data': null,
        'method': 'GET',
        'send': function send (data) { return this.send(data); }
    }, {'ignoreNull': true});
    var json = opts.json;
    var data = opts.data;
    var method = opts.method;
    var xhr = new XMLHttpRequest();

    if (/GET/i.test(method) && data) {

        url = request.appendData(url, data);
        data = null;

    }

    xhr.open(method, url);

    if (json) {

        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.responseType = 'json';

    }

    xhr.onerror = xhr.onload = function onreponse (e) {

        var status = this.status;
        var content = ('response' in this
			? this.response
			: this.responseText
        );
        var error = (status < 200 || status >= 400
			? new Error('Bad status: ' + status)
			: e.type === 'error'
			? new Error('Unknown error.')
			: null
        );

        xhr.onerror = xhr.onload = null;

        if (fn) { fn.call(this, error, content); }

    };

    return opts.send.call(xhr, data, options);

}

defineProperties(request, /** @lends just.request */{

    /**
     * Append data to the search params of the given url.
     *
     * @function
     * @param {string} url - Some url.
     * @param {*} data - Expects an object literal.
     * @example
     * appendData('/some', {'data': 1}); // > '/some?data=1'
     * appendData('/some?url', {'data': 1}); // > '/some?url&data=1'
     *
     * @returns {string}
     */
    'appendData': function appendDataToUrl (url, data) {

        var parsedUrl = parseUrl(url);

        return [
            parsedUrl.origin,
            parsedUrl.pathname,
            (parsedUrl.search + '&' || '?') + request.dataToUrl(data),
            parsedUrl.hash
        ].join('');

    },
    /**
     * Convert data into search params.
     *
     * @function
     * @param {*} data - Expects an object literal.
     * @example
     * dataToUrl({'a': '&a', 'b': 2}); // > 'a=%26&b=2'
     *
     * @returns {string}
     */
    'dataToUrl': function convertDataIntoUrl (data) {

        var dataObject = Object(data);

        return Object.keys(dataObject).map(
            function (key) { return encodeURIComponent(key) + '=' + encodeURIComponent(dataObject[key]); }
        ).join('&');

    }

});

module.exports = request;
