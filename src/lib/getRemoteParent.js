define([
	'./var/html'
], function (html) {
	
	'use strict';

	/**
	 * A function that checks if `this` is the Node that you're looking for.
	 * 
	 * @typedef {function} APR~getRemoteParent_fn
	 * @this {Node}
	 * @param {!Number} deepLevel A counter that indicates how many elements have checked.
	 * @return {boolean}
	 */
	/**
	 * Goes up through the `childNode` parents, until `fn` returns `true`
	 * or a non-Node is found.
	 * 
	 * @param  {Node} childNode Some child.
	 * @param  {APR~getRemoteParent_fn} fn Some custom handler.
	 * @param  {Node} [container=html] The farthest parent.  
	 * @param  {boolean} [includeChild=false] If true, it calls `fn` with `childNode` too.
	 * @return {?Node} The current Node when `fn` returns true.
	 * @example
	 * APR.getRemoteParent(APR.body, function () {
	 *     return this.tagName === 'HTML';
	 * }); // returns the html Element.
	 */
	return function getRemoteParent (childNode, fn, container, includeChild) {

		var parentNode = null;
		var deepLevel = 0;

		if (typeof fn !== 'function') {
			throw new TypeError(fn + ' is not a function.');
		}

		if (!(container instanceof Node)) {
			container = html;
		}

		if (!childNode) {
			return null;
		}

		if (includeChild && fn.call(childNode, deepLevel)) {
			return childNode;
		}

		while (
			(parentNode = (parentNode || childNode).parentNode) &&
			(parentNode !== container || (parentNode = null)) &&
			!fn.call(parentNode, ++deepLevel)
		);
		
		return parentNode;
	
	};

});