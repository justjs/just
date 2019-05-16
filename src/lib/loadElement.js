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
	 * @param  {APR~load_handler} [handler=function () { APR.head.appendChild(element); return this; }] If it's a function: it will be triggered (without appending the element),
	 *                                  otherwise: the element will be appended to {@link APR.head|head}.
	 * @property {Object.<APR~element_tag, APR~load_srcLikeAttribute>} NON_SRC_ATTRIBUTES {@link APR~element_tag|Element-tags} that are known for not using 'src' to fetch an url.
	 * @example
	 * 
	 * load('link', '/css/index.css', function (loadedFile) {
	 *
	 *     if (loadedFile) {
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

		var element, loadedFile, attribute;

		attribute = loadElement.NON_SRC_ATTRIBUTES[tag] || 'src';
		handler = defaults(handler, function (loadedFile) {
			
			if (!loadedFile) {
				head.appendChild(this);
			}

			return this;

		});
		loadedFile = getElements(tag +'[' + attribute + '="' + url + '"], ' + tag + '[' + attribute + '="' + parseUrl(url).href + '"]')[0];

		if (loadedFile) {
			return handler.call(element, loadedFile);
		}

		element = document.createElement(tag);
		element[attribute] = url;

		if (tag === 'link') {
			element.rel = 'stylesheet';
		}
	
		if (parseUrl(url).origin !== window.location.origin && ['video', 'img', 'script'].indexOf(tag) >= 0) {
			element.setAttribute('crossorigin', 'anonymous');
		}

		return handler.call(element, loadedFile);

	}, {

		'NON_SRC_ATTRIBUTES': {
			'link': 'href'
		}

	});

});