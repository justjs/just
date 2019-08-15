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
		
	/**
	 * Loads an external file if no other similar element is
	 * found.
	 *
	 * @namespace
	 * @memberof APR
	 * @param {element_tag} tag - A tag name.
	 * @param {url} url - The url of the file.
	 * @param {APR.loadElement~handler} [handler={@link APR.loadElement.DEFAULT_HANDLER}]
	 *     If it's a function: it will be triggered
	 *     (without appending the element),
	 *     otherwise: the element will be appended to
	 *     {@link APR.head|head}.
	 * @param  {APR.loadElement~listener} [listener] - A function to trigger after
	 *     the element is appended.
	 *
	 * @return {*} The return of the {@link APR.loadElement~handler|handler}.
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

	};

	Object.defineProperties(loadElement, /** @lends APR.loadElement */{
		/**
		 * A listener for the "onload" or "onerror" events.
		 *
		 * @typedef {function} APR.loadElement~listener
		 *
		 * @this Element
		 * @param {!Event} event - The triggered event.
		 * @return {*}
		 */

		/**
		 * A custom function to append the created element.
		 * 
		 * @typedef {function} APR.loadElement~handler
		 * @this {!Element} - The element that loads the url.
		 * @param {?Element} loadedElement - An identical element that has been loaded previously.
		 * @param {url} url - The given url to load.
		 *
		 * @return {*} Some value.
		 */

		/**
		 * The handler that will be provided in case that no function is provided.
		 *
		 * @type {APR.loadElement~handler}
		 * @readonly
		 * @chainable
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
		 * An src-like attribute for an Element.
		 *
		 * @typedef {string} APR.loadElement~srcLikeAttribute
		 */

		/**
		 * {@link element_tag|Element-tags} that are known
		 * for not using 'src' to fetch a url.
		 *
		 * @type {Object.<
		 *     element_tag,
		 *     APR.loadElement~srcLikeAttribute
		 * >}
		 */
		'nonSrcAttributes': {

			'value': {
				'link': 'href'
			}

		}

	});

	return APR.setFn('loadElement', loadElement);

});