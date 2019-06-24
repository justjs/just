define(['./core'], function (APR) {
		
	'use strict';

	/**
	 * Gets DOM Elements by a CSS Selector.
	 * 
	 * @param  {DOMString} selector A CSS selector.
	 * @param  {Node} [parent=document] The parent node.
	 *
	 * @return {Array} 
	 */
	return APR.setFn('getElements', function getElements (selector,
		parent) {

		return Array.from((parent || document).querySelectorAll(selector));
		
	});

});