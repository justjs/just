/**
 * Remove multiple events from multiple targets using
 * EventTarget#removeEventListener().
 *
 * @namespace
 * @memberof just
 * @since 1.0.0-rc.24
 * @param {Element|Element[]} targets - The targets of the attached events.
 * @param {string|string[]} eventTypes - Name of the attached events, like "click", "focus", ...
 * @param {function} listener - The same listener passed to EventTarget#addEventListener().
 * @param {*} [options=false] - The same options passed to EventTarget#addEventListener().
 */
function removeEventListener (targets, eventTypes, listener, options) {

    var opts = options || false;

    if (!Array.isArray(targets)) { targets = [targets]; }
    if (!Array.isArray(eventTypes)) { eventTypes = [eventTypes]; }

    targets.forEach(function (target) {

        eventTypes.forEach(function (eventType) {

            this.removeEventListener(eventType, listener, opts);

        }, target);

    });

}

module.exports = removeEventListener;
