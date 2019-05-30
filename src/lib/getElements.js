define(function () {
		
	'use strict';

	/**
	 * Gets DOM Elements by a CSS Selector. Note: CSS3 `selector`s are not supported by ie8.
	 * 
	 * @param  {DOMString} selector A CSS selector.
	 * @param  {Node} [parent=document] The parent node.
	 * @return {Array} 
	 */
	return function getElements (selector, parent) {
		return Array.from((parent || document).querySelectorAll(selector));
	};

});