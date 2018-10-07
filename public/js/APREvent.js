APR.Define('APR/Event').using(function () {

	var ArrayProto = Array.prototype;
	var _ = APR.createPrivateKey();

	function APREvent (elements) {

		if (!APR.is(this, APREvent)) {
			return new APREvent(elements);
		}

		if (elements) {
			this.length = ArrayProto.push.apply(this, APR.get(elements, [elements]));
		}

		ArrayProto.forEach.call(this, function (element) {
			
			if (!_(element).attachedEvents) {
				_(element).attachedEvents = {};
			}

		});

	}

	Object.assign(APREvent, {
		'getAttachedEvents' : function (element) {
			return _(element).attachedEvents;
		}
	});

	Object.assign(APREvent.prototype, {

		'addEvent' : (function () {

			var throttle = (function () {

				var useTimeout = (function () {

					var timeout;

					return function (fn, ms) {

						clearTimeout(timeout);

						timeout = setTimeout(function () {
							timeout = fn(), null;
						}, ms);

					};

				})();
				var useRAF = (function () { /* source: mozilla */

					var ticking = false;

					return function (fn) {
						
						if (ticking) {
							return;
						}
							
						window.requestAnimationFrame(function () {
							ticking = fn(), false;
						});

						ticking = true;

					};

				})();

				return function (ms, fn, args, thisArg) {

					var handler = function () {
						fn.apply(thisArg, args);
					};

					if (APR.is(ms, 'number')) {
						useTimeout(handler, ms);
					}
					else {
						useRAF(handler);
					}

				};

			})();
			var DEFAULT_OPTIONS = {
				'useCapture' : false,
				'once' : false,
				'detail' : null,
				'bubbles' : void 0,
				'throttle' : void 0,
				'isCloned' : void 0,
				'isCustomEvent' : void 0
			};

			return function (name, handler, options) {

				var instance = this;
				var listener = function (e) {
					
					if (options.once) {
						instance.removeListener(listener);
					}

					if (!options.throttle) {
						handler.call(this, e, options.detail);
					}
					else {
						throttle(options.throttle, handler, [e, options.detail], this);
					}

				};
				var type = (options = APR.get(options, {})).isCustomEvent ? name.slice(name.lastIndexOf('.') + 1) : name;
				var id = name;

				options = Object.assign(options, DEFAULT_OPTIONS);

				if (APR.is(options.bubbles, 'boolean')) {
					options.useCapture = !options.bubbles;
				}

				ArrayProto.forEach.call(this, function (element) {

					if (_(handler).id === id && _(element).attachedEvents[id]) {
						return;
					}

					_(handler).id = id;

					element.addEventListener(type, listener, options.useCapture);

					_(element).attachedEvents[id] = {
						'type' : type,
						'name' : name,
						'originalListener' : handler,
						'listener' : listener,
						'options' : options
					};

				});

				return this;

			};

		})(),
		'addCustomEvent' : function (type, handler, options) {
		
			this.addEvent(type, handler, Object.assign(APR.get(options, {}), {
				'isCustomEvent' : true
			}));

			return this;

		},
		'removeEvent' : function (name, listenerName) {

			this.eachEvent(function (handler, id) {

				if (handler.name === name && APR.is(listenerName, 'undefined') || APR.getFunctionName(handler.originalListener) === listenerName) {
					this.removeListener(handler.originalListener);
				}

			});

			return this;

		},
		'removeListener' : function (listener) {

			var id = _(listener).id;

			ArrayProto.forEach.call(this, function (element) {

				var handler = APREvent.getAttachedEvents(element)[id];

				element.removeEventListener(handler.type, handler.listener, handler.options.useCapture);
				
				delete _(element).attachedEvents[id];

			});

			delete _(listener).id;

			return this;
		},
		'cloneEvents' : function (target) {
			
			var aprTarget = new APREvent(target);

			this.eachEvent(function (handler, id) {

				aprTarget.addEvent(handler.name, handler.originalListener, APR.assign(handler.options, {
					'isCloned' : true
				}));

			});
			
			return this;

		},
		'eachEvent' : function (handler, thisArg) {
			
			ArrayProto.forEach.call(this, function (element) {
				APR.eachProperty(APREvent.getAttachedEvents(element), handler, thisArg);
			}, this);

			return this;
		},
		'triggerEvent' : function (type, params) {

			this.eachEvent(function () {

				if (handler.type !== type) {
					return;
				}

				if (!APR.is(params, 'undefined')) {
					handler.options = Object.assign(APR.get(handler.options, {}), {'detail' : params});
				}

				element.dispatchEvent(new CustomEvent(type, handler.options));

			});

			return this;

		},
		'addGlobalEvent' : (function () {

			var NON_BUBBLING_TO_BUBBLING = {
				'focus' : 'focusin',
				'blur' : 'focusout',
				'mouseenter' : 'mouseover',
				'mouseleave' : 'mouseout'
			};
			var NON_BUBBLING_EVENTS = ['load', 'unload', 'abort', 'error'];

			return function (eventName, events, options) {

				if (!APR.is(events, {})) {
					throw new TypeError('"' + events + '" must be a key-value object.');
				}

				options = APR.get(options, {});

				if (!options.force && APR.inArray(NON_BUBBLING_EVENTS, eventName)) {
					throw new TypeError(eventName + ' doesn\'t bubble, but you can attach it anyway adding {force: true} (in the options parameter).');
				}

				this.addEvent(NON_BUBBLING_TO_BUBBLING[eventName] || eventName, function (e, params) {

					var somethingMatched = false;

					APR.getRemoteParent(this, function () {

						if (this === e.target) {
							return true;
						}

						APR.eachProperty(events, function (handler, selector) {
							
							if (this.matches(selector)) {
								somethingMatched = true;
								handler.call(this, e, params);
							}

						}, this);

						return false;

					});

					if (!somethingMatched && APR.is(events['elsewhere'], 'function')) {
						events['elsewhere'].call(this, e, params);
					}

				}, Object.assign(options, {
					'bubbles' : true
				}));

				return this;

			};

		})()

	}, {'constructor' : APREvent});

	if (!APR.Event) {
		APR.Event = APREvent;
	}

});