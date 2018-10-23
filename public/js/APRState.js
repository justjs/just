APR.Define('APR/State').using({
	'0:APR/Event' : APR.self.setFileUrl('APREvent', 'js')
}, function (APREvent) {

	'use strict';
	
	var ArrayProto = Array.prototype;
	var location = window.location;
	var history = window.history;
	var _ = Object.assign(APR.createPrivateKey(), {
		'isLiteralKey' : function (stateKey) {
			return /^("|').+("|')$/.test(stateKey);
		},
		'getStates' : function (element) {

			var states = element.getAttribute(APRState.ATTRIBUTE_NAME);
			
			if (!states) {
				throw new TypeError('The element must have a "' + APRState.ATTRIBUTE_NAME + '" attribute.');
			}

			return APR.stringToJSON(states);
		
		},
		'getStateName' : function (element, stateKey) {
			return _.isLiteralKey(stateKey) ? stateKey : _.getStates(element)[stateKey] || '';
		},
		'addStatesToAttribute' : function (element, states) {

			var key = APRState.ATTRIBUTE_NAME;
			var value = Object.assign(_.getStates(element), states);
				
			element.setAttribute(key, JSON.stringify(value));

		}
	});

	function APRState (elements) {

		if (!(this instanceof APRState)) {
			return new APRState(elements);
		}

		if (this.constructor === APRState) {
			this.length = ArrayProto.push.apply(this, APR.defaults(elements, [elements]));
		}

		APREvent.call(this);

	}

	Object.assign(APRState, {
		'ATTRIBUTE_NAME' : 'data-APR-states',
		'findElementsByState' : function (stateKey, parent) {
			return APR.getElements('*[' + APRState.ATTRIBUTE_NAME + ']', parent).filter(function (element) {
				return APR.inArray(Object.keys(_.getStates(element)), stateKey);
			});
		},
		'getEventName' : function (element, stateKey) {
			return 'APRState.' + _.getStateName(element, stateKey).replace(/[\W\_]+/g, '').toLowerCase();
		},
		'url' : Object.create({
			'FALLBACK_HASH_SUFIX' : '!',
			'EVENT_NAME' : 'url:hasChanged',
			'changeState' : function (action, url, cause, eventParams) {

				var instance = new APRState(window);
				var _this = this;

				_(instance).customHandler = function (element, privateStateDetails) {

					var title = (eventParams = APR.defaults(eventParams, {})).$title;
					var state = eventParams.$state;
					var eventType = '';
					var isPush = /^push$/i.test(action);
					var isReplace = /^replace$/i.test(action);
					var isInit = /^init$/i.test(action);
					var wasFallbackTriggered = false;

					if (!isPush && !isReplace && !isInit) {
						throw new TypeError('"' + action + '" is invalid or it\'s not implemented.');
					}

					if (isPush && history.pushState) {
						history.pushState(state, title, url);
						eventType = 'pushState';
					}
					else if (isReplace && history.replaceState) {
						history.replaceState(state, title, url);
						eventType = 'replaceState';
					}
					else if (!isInit) {
						location.href = '#' + _this.FALLBACK_HASH_SUFIX + url;
						eventType = 'hashchange';
						wasFallbackTriggered = true;
					}
					else {
						eventType = 'init';
					}

					if (typeof title !== 'undefined' && document.title !== title) {
						document.title = title;
					}

					Object.assign(privateStateDetails, {
						'type' : eventType,
						'urlChanged' : true,
						'wasFallbackTriggered' : wasFallbackTriggered,
						'url' : url
					});

				};

				instance.changeState(action, '"' + this.EVENT_NAME + '"', cause, eventParams);

				return instance;

			},
			'pushState' : function (url, cause, eventParams) {
				return this.changeState('push', url, cause, eventParams);
			},
			'replaceState' : function (url, cause, eventParams) {
				return this.changeState('replace', url, cause, eventParams);
			},
			'listenState' : function (conditions, handler, options) {

				var instance = new APRState(window);
				var against = (options = APR.defaults(options, {})).against;

				_(handler).data = {
					'against' : APR.defaults(against, [against || 'href']),
					'conditions' : APR.defaults(conditions, [conditions])
				};

				_(instance).customHandler = function checkEachRoute (_, params, state) {

					new APREvent(this).eachEvent(function (handler, id) {

						var handlerData = _(handler).data;
						var match;

						if (!handlerData) {
							return;
						}

						match = handlerData.conditions.some(function (condition) {

							return handlerData.against.some(function (property) {

								var parsedUrl = APR.parsedUrl(state.url);
								var url = parsedUrl[property];

								return (
									condition instanceof RegExp && condition.test(url) ||
									typeof condition === 'function' && condition(url) ||
									condition === url
								);

							});

						});

						if (!match) {
							return;
						}

						handler.call(this, state.cause, params, state);

					});

				};

				if (against) {
					delete options.against;
				}

				instance.listenState('"' + this.EVENT_NAME + '"', handler, options);

				return instance;

			}

		})
	});

	APRState.prototype = Object.assign(Object.create(APREvent.prototype), APRState.prototype, {

		'getStates' : function () {

			var results = APR.eachElement(this, function (element) {
				return _.getStates(element);
			});

			return APR.getFirstOrMultiple(results);

		},
		'getState' : function (stateKey) {

			var results = APR.eachElement(this, function (element) {
				return _.getStates(element)[stateKey];
			});

			return APR.getFirstOrMultiple(results);

		},
		'listenState' : function (stateKey, handler, eventOptions) {

			var instance = this;
			var isLiteralKey = _.isLiteralKey(stateKey);
			var privateHandler = APR.defaults(_(this), {}).customHandler;

			ArrayProto.forEach.call(this, function (element) {

				if (!privateHandler && isLiteralKey) {
					_.addStatesToAttribute(element, APR.setDynamicKeys({}, [stateKey, stateKey]));
				}

				new APREvent(element).addCustomEvent(APRState.getEventName(element, stateKey), function (e, params) {

					var state = APR.defaults(_(APR.defaults(e.detail, {})), {}).state;
					var cause;

					if (!state) {
						return handler.call(this, e, params), void 0;
					}

					delete _(e.detail);

					if (typeof state.cause === 'undefined') {
						return;
					}

					Object.assign(state, {
						'event' : e
					});

					if (typeof privateHandler === 'function') {
						privateHandler.call(this, handler, params, state);
					}
					else {
						handler.call(this, state.cause, params, state);
					}

				}, eventOptions);

			});

			return this;

		},
		'changeState' : function (action, stateKey, cause, eventParams) {

			var privateHandler = APR.defaults(_(this), {}).customHandler;

			action = action.toLowerCase().trim();
			eventParams = APR.defaults(eventParams, {});

			ArrayProto.forEach.call(this, function (element) {
			
				var eventParamsClon = Object.assign({}, eventParams);
				var stateName = _.getStateName(element, stateKey);
				
				_(eventParamsClon).state = {
					'action' : action,
					'cause' : cause,
					'name' : stateName
				};

				if (typeof privateHandler === 'function') {
					privateHandler.call(this, element, _(eventParamsClon).state);
				}
				else if (/^(add|remove|toggle|replace)$/.test(action)) {
					
					element.classList[action](stateName);
					
					Object.assign(_(eventParamsClon).state, {
						'hasIt' : new APRState(element).hasState(stateKey),
						'type' : 'classList'
					});

				}
				else {
					throw new TypeError('"' + action + '" is not a valid action.');
				}

				new APREvent(element).triggerEvent(APRState.getEventName(element, stateKey), eventParamsClon);

			}, this);

			return this;

		},
		'hasState' : function (stateKey) {

			var results = APR.eachElement(this, function (element) {
			
				var stateName = _.getStateName(element, stateKey);
			
				return element.classList.contains(stateName);
			
			});

			return APR.getFirstOrMultiple(results);

		},
		'addState' : function (stateKey, cause, eventParams) {
			return this.changeState('add', stateKey, cause, eventParams);
		},
		'toggleState' : function (stateKey, cause, eventParams) {
			return this.changeState('toggle', stateKey, cause, eventParams);
		},
		'removeState' : function (stateKey, cause, eventParams) {
			return this.changeState('remove', stateKey, cause, eventParams);
		},
		'replaceState' : function (stateKey, cause, eventParams) {
			return this.changeState('replace', stateKey, cause, eventParams);
		}

	}, {'constructor' : APRState});

	if (!APR.State) {
		APR.State = APRState;
	}

});