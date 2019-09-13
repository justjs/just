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
	 */
	var on = function (elements, eventNames, listener, options) {
		if (typeof elements === 'string') {
			elements = findElements(elements);
		}

		if (!Array.isArray(eventNames)) {
			eventNames = [eventNames];
		}

		if (elements && !('length' in elements)) {
			elements = [elements];
		}

		[].slice.call(elements || []).forEach(function (element) {
			eventNames.forEach(function (eventName) {
				element.addEventListener(eventName, listener, options || false);
			});
		});
	};

	return APR.setFn('on', on);
});