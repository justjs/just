var just = require('./core');
var findElements = require('./findElements');
var parseUrl = require('./parseUrl');
/**
 * Loads an external file if no other similar element is
 * found.
 *
 * @namespace
 * @memberof just
 * @param {element_tag} tag - A tag name.
 * @param {url} url - The url of the file.
 * @param {just.loadElement~handler} [handler={@link just.loadElement.DEFAULT_HANDLER}]
 *     If it's a function: it will be triggered
 *     (without appending the element),
 *     otherwise: the element will be appended to
 *     {@link just.head|head}.
 * @param  {just.loadElement~listener} [listener] - A function to trigger after
 *     the element is appended.
 *
 * @return {*} The return of the {@link just.loadElement~handler|handler}.
 */
var loadElement = function loadElement (tag, url, listener, handler) {

    var attribute = loadElement.nonSrcAttributes[tag] || 'src';
    var element = document.createElement(tag);
    var parsedUrl = parseUrl(url);
    var selectors = [
        tag +'[' + attribute + '="' + url + '"]',
        tag + '[' + attribute + '="' + parsedUrl.href + '"]'
    ];
    var elementFound = findElements(selectors.join(','))[0] || null;
    var intercept = typeof handler === 'function' ? handler : loadElement.DEFAULT_HANDLER;

    if (!url) { throw new TypeError('The url is empty.'); }

    if (tag === 'link') {

        // Default attributes:
        element.rel = 'stylesheet';

    }

    if (parsedUrl.origin !== window.location.origin
        && ['video', 'img', 'script', 'link'].indexOf(tag) >= 0) {

        element.setAttribute('crossorigin', 'anonymous');

    }

    if (typeof listener === 'function') {

        element.onerror = element.onload = function (e) {

            this.onload = this.onerror = null;

            return listener.call(this, e);

        };

    }

    element[attribute] = url;

    return intercept.call(element, elementFound, url);

};

just.register({'loadElement': [loadElement, /** @lends just.loadElement */{
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
     * The handler that will be provided in case that no function is provided.
     *
     * @type {just.loadElement~handler}
     * @readonly
     * @chainable
     */
    'DEFAULT_HANDLER': function (elementFound, url) {

        if (!elementFound) { document.head.appendChild(this); }

        return this;

    },

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

}]});

module.exports = loadElement;
