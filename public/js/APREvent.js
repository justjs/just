APR.Define('APR.Event', APR).init(function () {

	var _ = APR.createPrivateKey({

		'debounce' : (function () {

			var _timeout;

			return function (handler) {

				var element = this.self.element;
				var args = Array.prototype.slice.call(arguments, 1);

				clearTimeout(_timeout);

				_timeout = setTimeout(function () {

					_timeout = null;

					handler.apply(element, args);

				}, 100);

			};

		})()

	});

	function APREvent (element) {

		if (!APR.is(this, APREvent)) {
			return new APREvent(element);
		}

		this.element = element;

		if (!_(this.element).attachedEvents) {
			_(this.element).attachedEvents = {};
		}

		_(this).self = this;

	}

	Object.assign(APREvent.prototype, {

		'addEvent' : function (name, handler, options) {

			var _this = this;
			var listener = function (e) {
				
				if (options.isOneTimeEvent) {
					_this.removeListener(listener);
				}

				if (!options.debounce) {
					handler.call(this, e, options.detail);
				}
				else {
					_(_this).debounce(handler, e, options.detail);
				}

			};
			var type = name.slice(name.lastIndexOf('.') + 1);
			var uid = name;

			options = APR.get(options, {
				'bubbles' : false,
				'isOneTimeEvent' : false,
				'debounce' : false,
				'detail' : null,
				'isCloned' : false
			});

			APR.eachProperty(options, function (v, k) {
				
				if (v) {
					uid += '_' + k;
				}

			});

			if (_(handler).handlerID === uid && _(this.element).attachedEvents[uid]) {
				return this;
			}

			if (options.isCustomEvent) {
				type = name;
			}

			this.element.addEventListener(type, listener, options.bubbles);

			_(this.element).attachedEvents[_(handler).handlerID = uid] = {
				'type' : type,
				'name' : name,
				'originalListener' : handler,
				'listener' : listener,
				'options' : options
			};

			return this;

		},
		'addCustomEvent' : function (type, handler, options) {
		
			this.addEvent(type, handler, Object.assign(APR.get(options, {}), {
				'isCustomEvent' : true
			}));

			return this;

		},
		'createEvent' : function (type, handler, options) {
			return new CustomEvent(type, options);
		},
		'removeEvent' : function (name, listenerName) {

			var _this = this;

			APR.eachProperty(this.getAttachedEvents(), function (handler, id) {

				if (handler.name === name && APR.is(listenerName, 'undefined') || APR.getFunctionName(handler.originalListener) === listenerName) {
					_this.removeListener(handler.originalListener);
				}

			});

			return this;

		},
		'removeListener' : function (listener) {

			var handlerID = _(listener).handlerID;
			var handler = this.getAttachedEvents(handlerID);

			this.element.removeEventListener(handler.type, handler.listener, handler.options.bubbles);
			
			delete _(this.element).attachedEvents[handlerID];
			delete _(listener).handlerID;

			return this;
		},
		'getAttachedEvents' : function (key) {
			var attachedEvents = _(this.element).attachedEvents;
			return key ? attachedEvents[key] : attachedEvents;
		},
		'cloneEvents' : function (target) {
		
			APR.eachProperty(this.getAttachedEvents(), function (handler, id) {
				APREvent(target).addEvent(handler.name, handler.originalListener, APR.assign(handler.options, {
					'isCloned' : true
				}));
			});
			
			return this;

		},
		'triggerEvent' : function (type, params) {

			var _this = this;
			var element = this.element;

			APR.eachProperty(this.getAttachedEvents(), function (handler) {

				if (handler.type !== type) {
					return;
				}

				if (!APR.is(params, 'undefined')) {
					handler.options = APR.get(handler.options, {});
					handler.options = Object.assign(handler.options, {'detail' : params});
				}

				element.dispatchEvent(_this.createEvent(type, handler.listener, handler.options));

			});

			return this;

		},
		'addGlobalEvent' : function (eventName, events, options) {

			if (!APR.is(events, {})) {
				throw new TypeError('"' + events + '" must be an object.');
			}

			this.addEvent(eventName, function (e) {

				var element = this;
				var wasEventCalled = false;
				var currentTarget = e.target;

				while (currentTarget && currentTarget !== element) {

					APR.eachProperty(events, function (handler, targetSelector) {

						var slicedSelector = targetSelector.slice(1);

						if (targetSelector[0] === '.' && APR.hasClass.call(currentTarget, slicedSelector) ||
							targetSelector[0] === '#' && currentTarget.id === slicedSelector ||
							targetSelector.toUpperCase() === currentTarget.tagName
						) {
							wasEventCalled = true;
							handler.call(currentTarget, e, options);
						}

					});

					currentTarget = currentTarget.parentNode;
				
				}

				if (!wasEventCalled && APR.is(events['elsewhere'], 'function')) {
					events['elsewhere'].call(element, e, APR.get(options, {}).params);
				}

			}, Object.assign(options, {
				'bubbles' : true
			}));

			return this;

		}

	}, {'constructor' : APREvent});

	if (!APR.Event) {
		APR.Event = APREvent;
	}

});