define(['./core'], function (APR) {
	
	'use strict';

	return APR.setFn('getRemoteParent', /** @lends APR */
	/**
	 * A function that checks if `this` is the Node that you're looking for.
	 * 
	 * @typedef {function} APR~getRemoteParent_fn
	 *
	 * @this {Node}
	 *
	 * @param {!Number} deepLevel - A counter that indicates how many elements have checked.
	 * @param {Node} rootContainer - The root container.
	 *
	 * @return {boolean}
	 */

	/**
	 * Goes up through the `childNode` parents, until `fn` returns `true`
	 * or a non-Node is found.
	 * 
	 * @function
	 * @param {Node} childNode - Some child.
	 * @param {APR~getRemoteParent_fn} fn - Some custom handler.
	 * @param {Node} [rootContainer=html] - The farthest parent.  
	 * @param {boolean} [includeChild=false] - If `true`, it calls `fn` with `childNode` too.
	 *
	 * @example
	 * APR.getRemoteParent(APR.body, function () {
	 *     return this.tagName === 'HTML';
	 * }); // returns the <html> Element.
	 *
	 * @return {Node|null} - The current Node when `fn` returns true.
	 */
	function getRemoteParent (childNode, fn, rootContainer, includeChild) {

		var currentNode = childNode;
		var deepLevel = 0;
		
		if (typeof fn !== 'function') {
			throw new TypeError(fn + ' is not a function.');
		}

		if (!(childNode instanceof Node)) {
			throw new TypeError('The child isn\'t an instance of a Node.');
		}

		if (!(rootContainer instanceof Node)) {
			rootContainer = document.documentElement;
		}

		while (currentNode) {

			if ((deepLevel > 0 || includeChild)
				&& fn.call(currentNode, deepLevel, rootContainer)) {
				return currentNode;
			}

			if (currentNode === rootContainer) {
				return null;
			}

			currentNode = currentNode.parentNode;
			deepLevel++;

		}

		return null;

	});

});