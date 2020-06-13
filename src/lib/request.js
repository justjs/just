var defaults = require('./defaults');
var parseUrl = require('./parseUrl');
var defineProperties = require('./defineProperties');
var eachProperty = require('./eachProperty');

/**
 * A function to intercept and send the request.
 *
 * @this {XMLHttpRequest}
 * @param {*} data - The data ready to be sent.
 * @param {!object} options - The options for the request.
 * @typedef {function} just.request~send
 */
/**
 * A function to call onreadystatechage event.
 *
 * @this {XMLHttpRequest}
 * @param {?Error} error - Bad status error or null.
 * @param {*} response - response or responseText.
 * @typedef {function} just.request~fn
 */
/**
 * Make a request using XMLHttpRequest.
 *
 * @namespace
 * @memberof just
 * @param {!string} url - Some url.
 * @param {!just.request~fn} fn - Hook for onreadystatechange listener.
 * @param {?object} options
 * @param {?string} [options.method="GET"] - Method for the request.
 * @param {?boolean} [options.json=/.json$/.test(url)] - .
 * @param {*} [options.data=null] - Data to send.
 * @param {?function} [send=just.request~send] - A custom function to intercept and send the request.
 * @param {?boolean} [options.async=true]
 * @param {?string} [options.user=null]
 * @param {?string} [options.pwd=null]
 * @param {object} [options.props=options.json ? {responseType: 'json'} : {}] - Properties for the xhr instance.
 * @param {object} [options.headers={'X-Requested-With': 'XMLHttpRequest', ...(options.json ? {'Content-Type': 'application/json'} : {})}] - Custom headers for the request.
 * @returns {*} The retuned value of {@link just.request~send}.
 */
function request (url, fn, options) {

    var isJSON = ('json' in Object(options)
        ? options.json
        : /\.json$/i.test(url)
    );
    var opts = defaults(options, {
        'json': isJSON,
        'data': null,
        'method': 'GET',
        'async': true,
        'user': null,
        'pwd': null,
        'headers': Object.assign({
            'X-Requested-With': 'XMLHttpRequest'
        }, (isJSON ? {
            'Content-Type': 'application/json'
        } : null)),
        'props': Object.assign({}, (isJSON ? {
            'responseType': 'json'
        } : null)),
        'send': function send (data) { return this.send(data); }
    }, {'ignoreNull': true});
    var data = opts.data;
    var method = opts.method;
    var async = opts.async;
    var user = opts.user;
    var password = opts.pwd;
    var props = opts.props;
    var headers = opts.headers;
    var xhr = new XMLHttpRequest();

    if (/GET/i.test(method) && data) {

        url = request.appendData(url, data);
        data = null;

    }

    xhr.open(method, url, async, user, password);

    eachProperty(headers, function setHeaders (value, key) { this.setRequestHeader(key, value); }, xhr);
    Object.assign(xhr, props);

    xhr.onreadystatechange = function onReadyStateChange (e) {

        var status, response, error;

        if (this.readyState === XMLHttpRequest.DONE) {

            this.onreadystatechange = null;
            status = this.status;
            response = ('response' in this
                ? this.response
                : this.responseText
            );
            error = ((status < 200 || status >= 400) && status !== 0
                ? new Error('Bad status: ' + status)
                : null
            );

            if (fn) { fn.call(this, error, response); }

        }

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
