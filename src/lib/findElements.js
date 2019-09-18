define(['./core'], function (APR) {

    'use strict';

    /**
     * Gets DOM Elements by a CSS Selector and always
     * returns an array.
     *
     * @namespace
     * @memberof APR
     * @param {DOMString} selector - A CSS selector.
     * @param {Node} [parent=document] - The parent node.
     *
     * @return {!Array} The found elements.
     */
    var findElements = function findElements (selector, parent) {

        return Array.from((parent || document).querySelectorAll(selector));

    };

    return APR.setFn('findElements', findElements);

});
