var defaults = require('./defaults');
var parseUrl = require('./parseUrl');
var defineProperties = require('./defineProperties');
var eachProperty = require('./eachProperty');
var parseJSON = require('./parseJSON');

/**
 * A function to intercept and send the request.
 *
 * @this {XMLHttpRequest}
 * @param {*} data - The data ready to be sent.
 * @param {!object} options - The options for the request.
 * @typedef {function} just.request~send
 */
/**
 * A function to call on "load"/"error" event.
 *
 * @this {XMLHttpRequest}
 * @param {?Error} error - Bad status error or <code>null</code>.
 * @param {*} response - Either #response or #responseText property.
 *            On JSON request, the property parsed as a JSON.
 * @typedef {function} just.request~fn
 */
/**
 * Default request headers.
 *
 * @property {string} [X-Requested-With="XMLHttpRequest"]
 * @property {string} [Content-Type="application/json"] - Only on JSON requests.
 * @typedef {!object} just.request~defaultHeaders
 */
/**
 * Default request properties.
 *
 * @property {string} [responseType="json"] - Only on JSON requests.
 * @typedef {object} just.request~defaultProps
 */
/**
 * Make a request using XMLHttpRequest.
 *
 * @namespace
 * @memberof just
 * @since 1.0.0-rc.23
 * @param {!url} url - Some url.
 * @param {just.request~fn} [fn] - Hook for onreadystatechange listener.
 * @param {object} [options]
 * @param {string} [options.method="GET"] - An HTTP Request Method: GET, POST, HEAD, ...
 * @param {boolean} [options.json=/.json$/.test(url)] - If <code>true</code>,
 *       <code>"Content-Type"</code> will be set to <code>"application/json"</code>,
 *       #responseType to <code>"json"</code>, and the #response/#responseText
 *       will be parsed to a JSON.
 * @param {*} [options.data=null] - Data to send.
 * @param {function} [options.send={@link just.request~send}] - A custom function to intercept and send the request.
 * @param {boolean} [options.async=true] - "async" param for XMLHttpRequest#open().
 * @param {string} [options.user=null] - User name to use for authentication purposes.
 * @param {string} [options.pwd=null] - Password to use for authentication purposes.
 * @param {object} [options.props={@link just.request~defaultProps}] - Properties for the xhr instance.
 * @param {object} [options.headers={@link just.request~defaultHeaders}] - Custom headers for the request.
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

            if (isJSON && typeof response !== 'object') { response = parseJSON(response); }
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
     * @param {?object} data - An object to be appended.
     * @example
     * appendData('/some', {'data': 1}); // > '/some?data=1'
     * appendData('/some?url', {'data': 1}); // > '/some?url&data=1'
     *
     * @returns {string}
     */
    'appendData': function appendDataToUrl (url, data) {

        var parsedUrl = parseUrl(url);
        var searchParams = request.dataToUrl(data);
        var search = ((/\?.+/.test(parsedUrl.search)
            ? parsedUrl.search + '&'
            : '?'
        ) + searchParams).replace(/[?&]$/, '');

        return [
            parsedUrl.origin,
            parsedUrl.pathname,
            search,
            parsedUrl.hash
        ].join('');

    },
    /**
     * Convert data into search params.
     *
     * @function
     * @param {?object} data - Expects an object literal.
     * @throws {TypeError} If <var>data</var> is not an object.
     * @example
     * dataToUrl({'a': '&a', 'b': 2}); // > 'a=%26&b=2'
     *
     * @returns {string}
     */
    'dataToUrl': function convertDataIntoUrl (data) {

        var dataObject = Object(data);

        if (typeof data !== 'object') { throw new TypeError(data + ' is not an object.'); }

        return Object.keys(dataObject).map(
            function (key) { return encodeURIComponent(key) + '=' + encodeURIComponent(dataObject[key]); }
        ).join('&');

    }

});

module.exports = request;
