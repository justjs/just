/**
 * Remove multiple events from multiple targets using
 * EventTarget#removeEventListener().
 *
 * @namespace
 * @memberof just
 * @since 1.0.0-rc.24
 * @param {Element|Element[]} targets
 * @param {string|string[]} eventTypes
 * @param {function} listener
 * @param {*} [options=false]
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
