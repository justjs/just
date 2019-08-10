define(['./core'], function (APR) {
		
	'use strict';

	return APR.setFn('findElements',
	/**
	 * Gets DOM Elements by a CSS Selector and always
	 * returns an array.
	 * 
	 * @function APR.findElements
	 * @param  {DOMString} selector A CSS selector.
	 * @param  {Node} [parent=document] The parent node.
	 *
	 * @return {!Array} The found elements.
	 */
	function findElements (selector, parent) {
		return Array.from((parent || document).querySelectorAll(selector));
	});

});