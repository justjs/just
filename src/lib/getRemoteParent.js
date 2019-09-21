define(['./core'], function (just) {

    'use strict';

    /**
     * A function that checks if `this` is the Node that you're looking for.
     *
     * @typedef {function} just.getRemoteParent~fn
     *
     * @this Node
     * @param {!Number} deepLevel - A counter that indicates how many elements have checked.
     * @param {Node} rootContainer - The root container.
     *
     * @return {boolean}
     */

    /**
     * Goes up through the `childNode` parents, until `fn` returns `true`
     * or a non-Node is found.
     *
     * @namespace
     * @memberof just
     * @param {Node} childNode - Some child.
     * @param {just.getRemoteParent~fn} fn - Some custom handler.
     * @param {Node} [rootContainer=html] - The farthest parent.
     * @param {boolean} [includeChild=false] - If `true`, it calls `fn` with `childNode` too.
     *
     * @example
     * just.getRemoteParent(just.body, function () {
     *     return this.tagName === 'HTML';
     * }); // returns the <html> Element.
     *
     * @return {Node|null} - The current Node when `fn` returns true.
     */
    var getRemoteParent = function getRemoteParent (childNode, fn, rootContainer, includeChild) {

        var currentNode = childNode;
        var deepLevel = 0;

        /* eslint-disable padded-blocks */
        if (typeof fn !== 'function') {
            throw new TypeError(fn + ' is not a function.');
        }

        if (!(childNode instanceof Node)) {
            throw new TypeError('The child isn\'t an instance of a Node.');
        }

        if (!(rootContainer instanceof Node)) {
            rootContainer = document.documentElement;
        }
        /* eslint-enable padded-blocks */

        while (currentNode) {

            if ((deepLevel > 0 || includeChild)
				&& fn.call(currentNode, deepLevel, rootContainer)) {

                return currentNode;

            }

            /* eslint-disable padded-blocks */
            if (currentNode === rootContainer) {
                return null;
            }
            /* eslint-enable padded-blocks */

            currentNode = currentNode.parentNode;
            deepLevel++;

        }

        return null;

    };

    return just.setFn('getRemoteParent', getRemoteParent);

});
