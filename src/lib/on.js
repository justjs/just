define(['./core', './findElements'], function (APR, findElements) {

    'use strict';

    /**
	 * Add an event listener to multiple elements.
	 *
	 * @namespace
	 * @memberof APR
	 * @param {string|Element[]} elements - The targets.
	 * @param {string|string[]} eventNames - The event types.
	 * @param {function} listener - The handler for the event.
	 * @param {object|boolean} [options=false] - Options for addEventListener
     * @return {Element[]} elements
	 */
    var on = function on (elements, eventNames, listener, options) {

        /* eslint-disable padded-blocks */
        if (typeof elements === 'string') {
            elements = findElements(elements);
        }

        if (!Array.isArray(eventNames)) {
            eventNames = [eventNames];
        }

        if (elements && !('length' in elements)) {
            elements = [elements];
        }
        /* eslint-enable padded-blocks */

        [].slice.call((elements = elements || [])).forEach(function (element) {

            eventNames.forEach(function (eventName) {

                element.addEventListener(eventName, listener, options || false);

            });

        });

        return elements;

    };

    return APR.setFn('on', on);

});
