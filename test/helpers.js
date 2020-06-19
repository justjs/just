/**
 * Query elements by <var>selector</var> and remove them from
 * the document.
 *
 * @param {...DOMString} selector - Valid strings for <var>document.querySelectorAll<var>.
 */
exports.removeElements = function removeElements (selector) {

    var selectors = [].slice.call(arguments).join(', ');

    [].forEach.call(document.querySelectorAll(selectors), function (element) {

        element.parentNode.removeChild(element);

    });

};
