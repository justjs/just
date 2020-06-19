var findElements = require('./findElements');

/**
 * Add an event listener to multiple elements.
 *
 * @namespace
 * @memberof just
 * @param {string|Element[]} elements - The targets.
 * @param {string|string[]} eventNames - The event types.
 * @param {function} listener - The handler for the event.
 * @param {object|boolean} [options=false] - Options for addEventListener
 * @return {Element[]} elements
 */
function addEventListener (elements, eventNames, listener, options) {

    var opts = options || false;
    /**
     * Prefer results.push() over elements.filter().map()
     * to avoid increasing complexity.
     */
    var results = [];

    if (typeof elements === 'string') { elements = findElements(elements); }
    if (!Array.isArray(eventNames)) { eventNames = [eventNames]; }
    if (!Array.isArray(elements)) { elements = [elements]; }

    elements.forEach(function (element) {

    	if (!('addEventListener' in element)) { return; }

        eventNames.forEach(function (eventType) {

        	this.addEventListener(eventType, listener, opts);

        }, element);

        this.push(element);

    }, results);

    return results;

}

module.exports = addEventListener;
