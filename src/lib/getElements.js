define(['./core'], function (APR) {
		
	'use strict';

	return APR.setFn('getElements', /** @lends APR */
	/**
	 * Gets DOM Elements by a CSS Selector.
	 * 
	 * @param  {DOMString} selector A CSS selector.
	 * @param  {Node} [parent=document] The parent node.
	 *
	 * @return {Array} 
	 */
	function getElements (selector,
		parent) {

		return Array.from((parent || document).querySelectorAll(selector));
		
	});

});