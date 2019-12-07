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
/**
 * Find <var>value</var> in <var>values</var> and remove it if it was found.
 *
 * @param {*} value
 * @param {array} values
 * @return {boolean} `true` if `value` was found, `false` otherwise.
 */
exports.findInArrayAndRemove = function (value, values) {

    return values.some(function (v, i) {

        if (value === v) {

            values.slice(i);

            return true;

        }

        return false;

    });

};
