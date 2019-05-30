define([
	'./var/head',
	'./getElements',
	'./defaults',
	'./parseUrl'
], function (head, getElements, defaults, parseUrl) {
		
	'use strict';

	/**
	 * A custom function to append the created element.
	 * 
	 * @typedef {function} APR~load_handler
	 * @this {!Element} The element that loads the url.
	 * @param {?Element} loadedElement An identical element that has been loaded previously.
	 * @param {String} url The given url to load.
	 * @return {*} Some value.
	 */
	
	/**
	 * An src-like attribute for an Element.
	 * @typedef {string} APR~load_srcLikeAttribute
	 */

	/**
	 * A tagName of an Element (such as "link").
	 * @typedef {string} APR~element_tag
	 */
	
	/**
	 * Loads an external file.
	 *
	 * @function
	 * @param  {APR~element_tag} tag A tag name.
	 * @param  {string} url The url of the file.
	 * @param  {APR~load_handler} [handler=DEFAULT_HANDLER] If it's a function: it will be triggered (without appending the element),
	 *                                  otherwise: the element will be appended to {@link APR.head|head}.
	 * @property {Object.<APR~element_tag, APR~load_srcLikeAttribute>} NON_SRC_ATTRIBUTES {@link APR~element_tag|Element-tags} that are known for not using 'src' to fetch an url.
	 * @property {APR~load_handler} DEFAULT_HANDLER The handler that will be provided in case that no function is provided.
	 * @example
	 * 
	 * loadElement('link', '/css/index.css', function (elementFound, url) {
	 *
	 *     if (elementFound) {
	 *         return;
	 *     }
	 *     
	 *     this.onload = function () {};
	 *     this.onerror = function () {};
	 *     
	 *     APR.head.appendChild(this);
	 *
	 * });
	 *
	 * @return {*} The return of the {@link APR~load_handler|handler}.
	 */
	return Object.assign(function loadElement (tag, url, handler) {

		var attribute = loadElement.NON_SRC_ATTRIBUTES[tag] || 'src';
		var elementFound = getElements(tag +'[' + attribute + '="' + url + '"], ' + tag + '[' + attribute + '="' + parseUrl(url).href + '"]')[0] || null;
		var element = document.createElement(tag);
		var container;
		
		handler = defaults(handler, loadElement.DEFAULT_HANDLER);

		if (tag === 'link') {
			element.rel = 'stylesheet';
		}
	
		if (parseUrl(url).origin !== window.location.origin && ['video', 'img', 'script'].indexOf(tag) >= 0) {
			element.setAttribute('crossorigin', 'anonymous');
		}
		
		element[attribute] = url;
		
		return handler.call(element, elementFound, url);

	}, {

		'NON_SRC_ATTRIBUTES': {
			'link': 'href'
		},
		'DEFAULT_HANDLER': function (elementFound) {

			if (!elementFound) {
				head.appendChild(this);
			}

			return this;

		}

	});

});