var defaults = require('./defaults');
var findElements = require('./findElements');
var defineProperties = require('./defineProperties');
var check = require('./check');
var eachProperty = require('./eachProperty');
var getRemoteParent = require('./getRemoteParent');
var Event = (function () {

    'use strict';

    var isEventTypeIncluded = function (option, eventType) {

        return option === true || defaults(option, [option]).indexOf(eventType) > -1;

    };
    var doThrottle = function (ms, callback, store) {

        var handler = function () {

            callback();
            store.temp = null;

        };

        if (typeof ms === 'number') {

            clearTimeout(store.temp);
            store.temp = setTimeout(handler, ms);

        }
        else {

            store.temp = true;
            window.requestAnimationFrame(handler);

        }

    };
    var store = function (element) {

        return element.justEvent = defaults(element.justEvent, {});

    };

    function Event (elements) {

        /* eslint-disable padded-blocks */
        if (!(this instanceof Event)) {
            return new Event(elements);
        }

        if (this.constructor === Event) {
            this.length = [].push.apply(this, defaults(elements, [elements]));
        }
        /* eslint-enable padded-blocks */

        [].forEach.call(this, function (element) {

            if (!store(element).attachedEvents) {

                store(element).attachedEvents = {};

            }

        });

    }

    defineProperties(Event, {

        'getAttachedEvents': function (element) {

            return store(element).attachedEvents;

        }

    });

    defineProperties(Event.prototype, {

        'addEvent': (function () {

            var DEFAULT_OPTIONS = {
                'useCapture': false,
                'once': false,
                'detail': null,
                'bubbles': void 0,
                'throttle': void 0,
                'cloned': void 0,
                'custom': void 0,
                'filter': null,
                'originalListener': void 0
            };

            return function (names, handler, options) {

                var instance = this;
                var listener = (function () {

                    var throttleStore = {};

                    return function (e) {

                        var params = options.detail;
                        var filter = options.filter;
                        var once = options.once;
                        var throttle = options.throttle;
                        var eventType = e.type;

                        if (typeof filter === 'function' && !filter.call(this, e, params)) {

                            return;

                        }

                        if (isEventTypeIncluded(once, eventType)) {

                            instance.removeListener(handler);

                        }

                        if (typeof throttle !== 'undefined') {

                            if (check(throttle, {})) {

                                throttle = throttle[eventType];

                            }
                            else if (isEventTypeIncluded(throttle, eventType)) {

                                throttle = true;

                            }

                            doThrottle(throttle, handler.bind(this, e, params), throttleStore);

                        }
                        else {

                            handler.call(this, e, params);

                        }

                    };

                })();

                options = Object.assign({}, DEFAULT_OPTIONS, options);

                if (typeof options.bubbles === 'boolean') {

                    options.useCapture = !options.bubbles;

                }

                defaults(names, [names]).forEach(function (name) {

                    var type = (isEventTypeIncluded(options.custom, name)
                        ? name
                        : name.slice(name.lastIndexOf('.') + 1)
                    );
                    var id = name;

                    [].forEach.call(this, function (element) {

                        if (store(handler).id === id && store(element).attachedEvents[id]) {

                            return;

                        }

                        store(handler).id = id;

                        element.addEventListener(type, listener, options.useCapture);

                        store(element).attachedEvents[id] = {
                            'type': type,
                            'name': name,
                            'hasNamespace': type !== name,
                            'originalListener': options.originalListener || handler,
                            'listener': listener,
                            'options': options
                        };

                        if (options.trigger) {

                            this.triggerEvent(name, options.trigger);

                        }

                    }, this);

                }, this);

                return this;

            };

        })(),
        'addCustomEvent': function (types, handler, options) {

            this.addEvent(types, handler, Object.assign(defaults(options, {}), {
                'custom': true
            }));

            return this;

        },
        /**
         * NOTE: This function uses function.name internally; minification might
         * introduce some bugs.
         */
        'removeEvent': function (name, listenerName) {

            this.eachEvent(function (handler, id) {

                if (handler.name === name && typeof listenerName === 'undefined'
                    || handler.originalListener.name === listenerName) {

                    this.removeListener(handler.originalListener);

                }

            });

            return this;

        },
        'removeListener': function (listener) {

            var id = store(listener).id;

            [].forEach.call(this, function (element) {

                var handler = Event.getAttachedEvents(element)[id];

                element.removeEventListener(handler.type, handler.listener, handler.options.useCapture);

                delete store(element).attachedEvents[id];

            });

            delete store(listener).id;

            return this;

        },
        'cloneEvents': function (target) {

            var justTarget = new Event(target);

            this.eachEvent(function (handler, id) {

                justTarget.addEvent(handler.name, handler.originalListener, Object.assign(handler.options, {
                    'cloned': true
                }));

            });

            return this;

        },
        'eachEvent': function (handler) {

            [].forEach.call(this, function (element) {

                eachProperty(Event.getAttachedEvents(element), handler, element);

            });

            return this;

        },
        'triggerEvent': function (type, params) {

            this.eachEvent(function (handler, namespacedType) {

                var customEvent;

                if (namespacedType !== type) {

                    return;

                }

                customEvent = new CustomEvent(type, Object.assign({}, handler.options, {'detail': params}));

                if (handler.hasNamespace && !handler.options.custom) {

                    handler.listener.call(this, customEvent);

                }
                else {

                    this.dispatchEvent(customEvent);

                }

            });

            return this;

        },
        'addGlobalEvent': (function () {

            var NON_BUBBLING_TO_BUBBLING = {
                'focus': 'focusin',
                'blur': 'focusout',
                'mouseenter': 'mouseover',
                'mouseleave': 'mouseout'
            };
            var NON_BUBBLING_EVENTS = ['load', 'unload', 'abort', 'error'];

            return function (eventNames, events, options) {

                check.throwable(events, {});
                options = defaults(options, {});

                defaults(eventNames, [eventNames]).forEach(function (eventName) {

                    if (!options.force && NON_BUBBLING_EVENTS.indexOf(eventName) > -1) {

                        throw new TypeError(eventName + ' doesn\'t bubble, but ' +
                            'you can attach it anyway adding {force: true} ' +
                            '(in the "options" parameter).');

                    }

                    this.addEvent(NON_BUBBLING_TO_BUBBLING[eventName] || eventName, function (e, params) {

                        var somethingMatched = false;
                        var triggerOptions = defaults(options.trigger, {
                            'addGlobalEvent': {}
                        });
                        var triggerTargets = (triggerOptions[e.type]
                            ? findElements(triggerOptions[e.type], this)
                            : [e.target]
                        );

                        triggerTargets.forEach(function (target) {

                            getRemoteParent(target, function () {

                                eachProperty(events, function (handler, selector) {

                                    if (this.matches && this.matches(selector)) {

                                        somethingMatched = true;
                                        handler.call(this, e, params);

                                    }

                                }, this);

                                return false;

                            }, this, true);

                        }, this);

                        if (!somethingMatched && typeof events.elsewhere === 'function') {

                            events.elsewhere.call(this, e, params);

                        }

                    }, Object.assign(options, {
                        'bubbles': true
                    }));

                }, this);

                return this;

            };

        })()

    });

    return Event;

})();

module.exports = Event;
