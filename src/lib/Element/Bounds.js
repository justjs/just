var defaults = require('../defaults');
var defineProperties = require('../defineProperties');

/**
 * Size of an Element.
 *
 * @typedef {object} just.Element.Bounds~size
 * @property {number} [width=0]
 * @property {number} [height=0]
 */

/**
 * Position of an Element.
 *
 * @typedef {object} just.Element.Bounds~position
 * @property {number} [top=0]
 * @property {number} [left=0]
 * @property {number} [right=x+width]
 * @property {number} [bottom=y+height]
 * @property {number} [x=left]
 * @property {number} [y=top]
 */

/**
 * A constructor to normalize the size and position of Elements.
 *
 * @namespace
 * @memberof just.Element
 *
 * @constructor
 * @param {just.Element.Bounds~position} position
 * @param {just.Element.Bounds~size} size
 */
function Bounds (position, size) {

    var x = defaults(position.x, position.left || 0);
    var y = defaults(position.y, position.top || 0);
    var width = defaults(size.width, 0);
    var height = defaults(size.height, 0);

    defineProperties(this, /** @lends just.Element.Bounds */{
        /** @member {number} */
        'x': x,
        /** @member {number} */
        'y': y,
        /** @member {number} */
        'left': x,
        /** @member {number} */
        'top': y,
        /** @member {number} */
        'width': width,
        /** @member {number} */
        'height': height,
        /** @member {number} */
        'bottom': y + height,
        /** @member {number} */
        'right': x + width
    });

}

module.exports = Bounds;
