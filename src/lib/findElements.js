var just = require('./core');
/**
 * Gets DOM Elements by a CSS Selector and always
 * returns an array.
 *
 * @namespace
 * @memberof just
 * @param {DOMString} selector - A CSS selector.
 * @param {Node} [parent=document] - The parent node.
 *
 * @return {!Array} The found elements.
 */
var findElements = function findElements (selector, parent) {

    return [].slice.call((parent || document).querySelectorAll(selector));

};

module.exports = just.register({'findElements': findElements}).findElements;
