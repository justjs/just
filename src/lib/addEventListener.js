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

    if (typeof elements === 'string') { elements = findElements(elements); }
    if (!Array.isArray(eventNames)) { eventNames = [eventNames]; }
    if (elements && !('length' in elements)) { elements = [elements]; }

    Array.from((elements = elements || []), function (element) {

        eventNames.forEach(function (eventName) {

            element.addEventListener(eventName, listener, options || false);

        });

    });

    return elements;

}

module.exports = addEventListener;
