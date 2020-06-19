var addEventListener = require('./addEventListener');
var findElements = require('./findElements');
var parseUrl = require('./parseUrl');
var createElement = require('./createElement');
var removeEventListener = require('./removeEventListener');

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
 * @param {!element_tag} tagName - A tag name.
 * @param {?url|?object} [properties] - The url of the file or the properties for the new element.
 * @param {?Node|just.loadElement~handler} [container=document.head]
 *     A custom function to append the element by yourself or a Node
 *     to append the created element to it.
 * @param  {just.loadElement~listener} [listener] - A function to trigger on element load/error.
 *
 * @return {Element|*} The created element, a similar element, or the returned value of
 *     {@link just.loadElement~handler|handler}.
 */
function loadElement (tagName, properties, listener, container) {

    var props = Object(typeof properties === 'object' ? properties : null);
    var urlProperty = /link/i.test(tagName) ? 'href' : 'src';
    var url = typeof arguments[1] === 'string' ? (props[urlProperty] = arguments[1]) : props[urlProperty];
    var isCrossOriginRequest = parseUrl(url).origin !== window.location.origin;
    var needsCrossOriginProperty = !('crossOrigin' in props) && ['video', 'img', 'script', 'link'].indexOf(tagName) !== -1;
    var isLinkElement = /link/i.test(tagName);
    var needsRelProperty = !('rel' in props);
    var similarElementSelector = tagName + '[' + urlProperty + '="' + (url || '') + '"]';
    var similarElement = findElements(similarElementSelector)[0] || null;
    var element = createElement(tagName, props);
    var listenerWrapper = function listenerWrapper (e) {

        removeEventListener(this, ['load', 'error'], listenerWrapper);

        return listener.call(this, e);

    };
    var invalidUrl = typeof url !== 'string' || url.trim() === '';

    if (invalidUrl) { throw new TypeError(url + ' is not valid url.'); }
    if (listener) { addEventListener(element, ['load', 'error'], listenerWrapper); }
    if (isCrossOriginRequest && needsCrossOriginProperty) { element.crossOrigin = 'anonymous'; }
    if (isLinkElement && needsRelProperty) { element.rel = 'stylesheet'; }

    if (typeof container === 'function') { return container.call(element, similarElement, url); }
    /*else */if (similarElement) { return similarElement; }
    /*else */if (!container) { container = document.head; }

    container.appendChild(element);

    return element;

}

module.exports = loadElement;
