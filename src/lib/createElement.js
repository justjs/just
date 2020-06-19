/**
 * Create an element with the given properties.
 *
 * @namespace
 * @memberof just
 * @since 1.0.0-rc.23
 * @param {string} tag - The tag name for the element.
 * @param {?object} properties - Properties for the created element.
 * @return {Element} The created element.
 */
function createElement (tag, properties) {

    var element = document.createElement(tag);

    Object.assign(element, properties);

    return element;

}

module.exports = createElement;
