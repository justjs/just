var findElements = require('./findElements');
var parseUrl = require('./parseUrl');
var defineProperties = require('./defineProperties');

/**
 * A listener for the "onload" or "onerror" events.
 *
 * @typedef {function} just.loadElement~listener
 *
 * @this Element
 * @param {!Event} event - The triggered event.
 * @return {*}
 */

/**
 * A custom function to append the created element.
 *
 * @typedef {function} just.loadElement~handler
 * @this {!Element} - The element that loads the url.
 * @param {?Element} loadedElement - An identical element that has been loaded previously.
 * @param {url} url - The given url to load.
 *
 * @return {*} Some value.
 */

/**
 * Loads an external file if no other similar element is
 * found.
 *
 * @namespace
 * @memberof just
 * @throws document.createElement exception or TypeError if <var>url</var> is missing.
 * @param {!element_tag} tag - A tag name.
 * @param {!url} url - The url of the file.
 * @param {just.loadElement~handler} [handler]
 *     If it's a function: it will be triggered
 *     (without appending the element),
 *     otherwise: the element will be appended to
 *     {@link just.head|head}.
 * @param  {just.loadElement~listener} [listener] - A function to trigger after
 *     the element is appended.
 *
 * @return {*} The return of the {@link just.loadElement~handler|handler}.
 */
function loadElement (tag, url, listener, handler) {

    var attribute = loadElement.nonSrcAttributes[tag] || 'src';
    var element = document.createElement(tag);
    var parsedUrl = parseUrl(url);
    var selectors = [url, parsedUrl.href].map(function (url) { return tag + '[' + attribute + '="' + url + '"]'; });
    var similarElement = findElements(selectors.join(','))[0] || null;
    var isValidUrl = typeof url === 'string' && url.trim() !== '';
    var isLinkElement;
    var isCrossOriginResource;

    if (!isValidUrl) { throw new TypeError(url + ' is not a valid url.'); }

    isLinkElement = element instanceof HTMLLinkElement;
    isCrossOriginResource = parsedUrl.origin !== window.location.origin
        && ['video', 'img', 'script', 'link'].indexOf(tag) >= 0;

    if (isLinkElement) { element.rel = 'stylesheet'; }
    if (isCrossOriginResource) { element.crossOrigin = 'anonymous'; }

    if (typeof listener === 'function') {

        element.onerror = element.onload = function (e) {

            this.onload = this.onerror = null;

            return listener.call(this, e);

        };

    }

    element[attribute] = url;

    if (typeof handler === 'function') { return handler.call(element, similarElement, url); }
    if (!similarElement) { document.head.appendChild(element); }

    return this;

}

defineProperties(loadElement, /** @lends just.loadElement */{

    /**
     * An src-like attribute for an Element.
     *
     * @typedef {string} just.loadElement~srcLikeAttribute
     */

    /**
     * {@link element_tag|Element-tags} that are known
     * for not using 'src' to fetch a url.
     *
     * @type {Object.<
     *     element_tag,
     *     just.loadElement~srcLikeAttribute
     * >}
     */
    'nonSrcAttributes': {
        'link': 'href'
    }

});

module.exports = loadElement;
