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

		if (!APR.is(this, APRState)) {
			return new APRState(elements);
		}

		if (elements) {
			this.length = ArrayProto.push.apply(this, APR.get(elements, [elements]));
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
		'url' : (function () {

			var STATE_KEY = '"url:hasChanged"';

			return Object.assign(Object.create({

				'changeState' : function (action, url, originalEvent, eventParams) {

					var title = (eventParams = APR.get(eventParams, {})).historyTitle;
					var state = eventParams.historyState;
					var eventType = '';
					var isPush = /^push$/i.test(action);
					var isReplace = /^replace$/i.test(action);
					var isInit = /^init$/i.test(action);

					if (APR.parseUrl(url).origin !== location.origin) {
						throw new TypeError('"' + url + '" must be in the same origin.');
					}

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
						location.href = '#' + APRState.url.FALLBACK_HASH_SUFIX + url;
						eventType = 'hashchange';
					}

					if (!APR.is(title, 'undefined') && document.title !== title) {
						document.title = title;
					}

					_(eventParams).state = {
						'originalEvent' : originalEvent,
						'action' : action,
						'name' : name,
						'url' : url
					};

					new APREvent(window).triggerEvent(STATE_KEY, eventParams);

					return this;

				},
				'pushState' : function (url, originalEvent, eventParams) {
					return APRState.url.changeState('push', url, originalEvent, eventParams);
				},
				'replaceState' : function (url, originalEvent, eventParams) {
					return APRState.url.changeState('replace', url, originalEvent, eventParams);
				},
				'listenState' : function (urls, handler, options) {

					var against = APR.get(options, {}).against;

					if (!APR.is(handler, 'function')) {
						throw new TypeError('"' + handler + '" must be a function.');
					}

					against = APR.get(against, [against]);
					urls = APR.get(urls, [urls || 'href']);

					new APREvent(window).addCustomEvent(STATE_KEY, function (e, params) {

						var element = this;
						var state = APR.get(_(e.detail), {}).state;
						var against = APR.get(options.against);
						var originalEvent;

						if (!state) {
							return handler.call(element, e, params), void 0;
						}

						originalEvent = state.originalEvent;

						delete _(e.detail);
						delete state.originalEvent;

						if (APR.is(originalEvent, 'undefined')) {
							return;
						}

						urls.forEach(function (expression) {

							var matched = against.some(function (property) {

								var parsedUrl = APR.parseUrl(state.url);
								var url = parseUrl[property];

								return (
									APR.is(expression, RegExp) && expression.test(url) ||
									APR.is(expression, 'function') && expression(url) ||
									expression === url
								);

							});

							if (!matched) {
								return;
							}

							handler.call(element, originalEvent, params, Object.assign(state, {
								'event' : e
							}));

						});

					});

					if (location.hash || history.state) {
						this.changeState('init', location.href, null, history.state);
					}

					return this;

					
				}
			}), {
				'FALLBACK_HASH_SUFIX' : '!'
			});

		})()
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

			APR.eachElement(this, function (element) {

				if (isLiteralKey) {
					_.addStatesToAttribute(element, APR.setDynamicKeys({}, [stateKey, stateKey]));
				}

				new APREvent(element).addCustomEvent(APRState.getEventName(element, stateKey), function (e, params) {

					var element = this;
					var state = APR.get(_(e.detail), {}).state;

					if (!state) {
						return handler.call(element, e, params), void 0;
					}

					delete _(e.detail);

					if (APR.is(state.originalEvent, 'undefined')) {
						return;
					}

					handler.call(element, state.originalEvent, params, {
						'event' : e,
						'action' : state.action,
						'name' : _(instance).getStateName(stateKey),
						'hasIt' : instance.hasState(stateKey)
					});

				}, eventOptions);

			});

			return this;

		},
		'changeState' : function (action, stateKey, originalEvent, eventParams) {

			if (!/^(add|remove|toggle|replace)$/.test(action = action.toLowerCase().trim())) {
				throw new TypeError('"' + action + '" is not a valid action.');
			}

			ArrayProto.forEach.call(this, function (element) {

				var stateName = _.getStateName(element, stateKey);

				element.classList[action](stateName);

				_(eventParams).state = {
					'action' : action,
					'originalEvent' : originalEvent
				};

				this.triggerEvent(APRState.getEventName(element, stateKey), eventParams);

			}, this);

			return this;

		},
		'hasState' : function (stateKey) {

			var results = APR.eachElement(this, function (element) {
			
				var stateName = _.getStateName(element, stateKey);
			
				return element.classList.contains(stateName);
			
			}, this);

			return APR.getFirstOrMultiple(results);

		},
		'addState' : function (stateKey, originalEvent, eventParams) {
			return this.changeState('add', stateKey, originalEvent, eventParams);
		},
		'toggleState' : function (stateKey, originalEvent, eventParams) {
			return this.changeState('toggle', stateKey, originalEvent, eventParams);
		},
		'removeState' : function (stateKey, originalEvent, eventParams) {
			return this.changeState('remove', stateKey, originalEvent, eventParams);
		},
		'replaceState' : function (stateKey, originalEvent, eventParams) {
			return this.changeState('replace', stateKey, originalEvent, eventParams);
		}

	}, {'constructor' : APRState});

	if (!APR.State) {
		APR.State = APRState;
	}

});