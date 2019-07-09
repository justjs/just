define(['./core'], function (APR) {
		
	'use strict';

	return APR.setFn('findElements', /** @lends APR */
	/**
	 * Gets DOM Elements by a CSS Selector.
	 * 
	 * @param  {DOMString} selector A CSS selector.
	 * @param  {Node} [parent=document] The parent node.
	 *
	 * @return {!Array} 
	 */
	function findElements (selector, parent) {
		return Array.from((parent || document).querySelectorAll(selector));
	});

});