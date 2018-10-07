APR.Define('APR/State').using({
	'0:APR/Event' : APR.self.setFileUrl('APREvent', 'js')
}, function (APREvent) {

	'use strict';
	
	var _ = Object.assign(APR.createPrivateKey({

		'getStateName' : function (stateKey) {
			
			var results = APR.eachElement(this, function (element) {
				return _.isLiteralKey(stateKey) ? stateKey : _.getStates(element)[stateKey] || '';
			});

			return APR.getFirstOrMultiple(results);

		},
		'addStatesToAttribute' : function (states) {

			APR.eachElement(this, function (element) {
				
				var key = APRState.ATTRIBUTE_NAME;
				var value = Object.assign(_.getStates(element), states);
				
				element.setAttribute(key, JSON.stringify(value));

			});

		}

	}), {
		'isLiteralKey' : function (stateKey) {
			return /^("|').+("|')$/.test(stateKey);
		},
		'getStates' : function (element) {

			var states = element.getAttribute(APRState.ATTRIBUTE_NAME);
			
			if (!states) {
				throw new TypeError('The element must have a "' + APRState.ATTRIBUTE_NAME + '" attribute.');
			}

			return APR.stringToJSON(states);
		
		}
	});

	function APRState (elements) {

		if (!APR.is(this, APRState)) {
			return new APRState(elements);
		}

		if (elements) {
			this.length = Array.prototype.push.apply(this, APR.get(elements, [elements]));
		}

		APREvent.call(this);

	}

	Object.assign(APRState, {
		'ATTRIBUTE_NAME' : 'data-APR-states',
		'findElementsByState' : function (stateKey, parent) {
			return APR.getElements('*[' + APRState.ATTRIBUTE_NAME + ']', parent).filter(function (element) {
				return APR.inArray(Object.keys(_.getStates(element)), stateKey);
			});
		}
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
		'getEventName' : function (stateKey) {
			return 'APRState.' + _(this).getStateName(stateKey).replace(/[\W\_]+/g, '').toLowerCase();
		},
		'listenState' : function (stateKey, handler, eventOptions) {

			var instance = this;

			if (_.isLiteralKey(stateKey)) {
				_(this).addStatesToAttribute(APR.setDynamicKeys({}, [stateKey, stateKey]));
			}

			this.addCustomEvent(this.getEventName(stateKey), function (e, params) {

				var element = this;
				var state = _(e.detail).state;

				delete _(e.detail);

				if (APR.is(state.originalEvent, 'undefined')) {
					return;
				}

				handler.call(element, state.originalEvent, params, Object.assign(state, {
					'event' : e,
					'name' : _(instance).getStateName(stateKey),
					'hasIt' : instance.hasState(stateKey)
				}));

			}, eventOptions);

			return this;

		},
		'changeState' : function (stateKey, action, originalEvent, eventParams) {

			var eventName = this.getEventName(stateKey);

			if (!/^(add|remove|toggle)$/i.test(action)) {
				throw new TypeError('"' + action + '" is not a valid action.');
			}

			element.classList[action.toLowerCase()](eventName);
			eventParams = APR.get(eventParams, {});

			_(eventParams).state = {
				'action' : action,
				'originalEvent' : originalEvent,
				'eventName' : eventName
			};

			this.triggerEvent(eventName, eventParams);

			return this;

		},
		'hasState' : function (stateKey) {

			var stateName = this.getStateName(stateKey);
			var results = APR.eachElement(this, function (element) {
				return element.classList.contains(stateName);
			}, this);

			return APR.getFirstOrMultiple(results);

		},
		'addState' : function (stateKey, originalEvent, eventParams) {
			return this.changeState(stateKey, 'add', originalEvent, eventParams);
		},
		'toggleState' : function (stateKey, originalEvent, eventParams) {
			return this.changeState(stateKey, 'toggle', originalEvent, eventParams);
		},
		'removeState' : function (stateKey, originalEvent, eventParams) {
			return this.changeState(stateKey, 'remove', originalEvent, eventParams);
		}

	}, {'constructor' : APRState});

	if (!APR.State) {
		APR.State = APRState;
	}

});