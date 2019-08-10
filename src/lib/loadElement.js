define([
	'./core',
	'./findElements',
	'./defaults',
	'./parseUrl'
], function (
	APR,
	findElements,
	defaults,
	parseUrl
) {
		
	'use strict';

	return APR.setFn('loadElement',
	/**
	 * A custom function to append the created element.
	 * 
	 * @typedef {function} APR~loadElement_handler
	 *
	 * @this {!Element} The element that loads the url.
	 *
	 * @param {?Element} loadedElement
	 *     An identical element that has been loaded previously.
	 *
	 * @param {String} url The given url to load.
	 *
	 * @return {*} Some value.
	 */
	
	/**
	 * @typedef {function} APR~loadElement_listener A listener for
	 * the "onload" or "onerror" events.
	 *
	 * @this {!Element} The target element.
	 *
	 * @param {!Event} event The triggered event.
	 * @return {undefined}
	 *
	 */

	/**
	 * An src-like attribute for an Element.
	 *
	 * @typedef {string} APR~loadElement_srcLikeAttribute
	 */

	/**
	 * A tagName of an Element (such as "link").
	 *
	 * @typedef {string} APR~element_tag
	 */
	
	/**
	 * Loads an external file if no other similar element is
	 * found.
	 *
	 * @function APR.loadElement
	 *
	 * @param  {APR~element_tag} tag A tag name.
	 *
	 * @param  {string} url The url of the file.
	 *
	 * @param  {APR~loadElement_handler} [handler=DEFAULT_HANDLER]
	 *     If it's a function: it will be triggered
	 *     (without appending the element),
	 *     otherwise: the element will be appended to
	 *     {@link APR.head|head}.
	 *
	 * @param  {APR~loadElement_listener} [listener]
	 *     A function to trigger after the element is appended.
	 *
	 * @return {*} The return of the {@link APR~loadElement_handler|handler}.
	 */
	function loadElement (tag, url, listener, handler) {

		var attribute = loadElement.nonSrcAttributes[tag] || 'src';
		var element = document.createElement(tag);
		var parsedUrl = parseUrl(url);
		var selectors = [
			tag +'[' + attribute + '="' + url + '"]',
			tag + '[' + attribute + '="' + parsedUrl.href + '"]'
		];
		var elementFound = findElements(selectors.join(','))[0] || null;
		var intercept = defaults(handler, loadElement.DEFAULT_HANDLER);

		if (tag === 'link') {
			element.rel = 'stylesheet';
		}
	
		if (parsedUrl.origin !== window.location.origin &&
			['video', 'img', 'script'].indexOf(tag) >= 0) {
			
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

	}, /** @lends APR.loadElement */{
		/**
		 * @property {APR~loadElement_handler} DEFAULT_HANDLER
		 *     The handler that will be provided in case that no
		 *     function is provided.
		 */
		'DEFAULT_HANDLER': {

			'value': function (elementFound, url) {

				if (!elementFound) {
					document.head.appendChild(this);
				}

				return this;

			}

		},
		/**
		 * @property {Object.<
		 *     APR~element_tag,
		 *     APR~loadElement_srcLikeAttribute
		 * >} nonSrcAttributes {@link APR~element_tag|Element-tags}
		 *     that are known for not using 'src' to fetch an url.
		 */
		'nonSrcAttributes': {

			'value': {
				'link': 'href'
			}

		}

	});

});