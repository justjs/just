APR.Define('APR/State').using({
	'0:APR/Event' : APR.self.setFileUrl('APREvent', 'js')
}, function (APREvent) {

	'use strict';
	
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
		'save' : function (eventParams, action, originalEvent) {

			eventParams = APR.get(eventParams, {});

			_(eventParams).state = {
				'action' : action,
				'originalEvent' : originalEvent
			};

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
			this.length = Array.prototype.push.apply(this, APR.get(elements, [elements]));
		}

		APREvent.call(this);

	}
APRState.pushState(this.href, e, {
	'data' : true
});
APRState.replaceState(this.href);
APRState.listenState(/\#/, function () {

});
	Object.assign(APRState, {
		'ATTRIBUTE_NAME' : 'data-APR-states',
		'findElementsByState' : function (stateKey, parent) {
			return APR.getElements('*[' + APRState.ATTRIBUTE_NAME + ']', parent).filter(function (element) {
				return APR.inArray(Object.keys(_.getStates(element)), stateKey);
			});
		},
		'pushState' : function (url, originalEvent, eventParams) {
			new APRState(window).triggerEvent(eventName, eventParams);
		},
		'replaceState' : function () {

		},
		'listenState' : function () {

		},
		'getEventName' : function (element, stateKey) {
			return 'APRState.' + _.getStateName(element, stateKey).replace(/[\W\_]+/g, '').toLowerCase();
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
		'listenState' : function (stateKey, handler, eventOptions) {

			var instance = this;
			var isLiteralKey = _.isLiteralKey(stateKey);

			APR.eachElement(this, function (element) {

				if (isLiteralKey) {
					_.addStatesToAttribute(element, APR.setDynamicKeys({}, [stateKey, stateKey]));
				}

				new APREvent(element).addCustomEvent(APRState.getEventName(element, stateKey), function (e, params) {

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

			});

			return this;

		},
		'changeState' : function (stateKey, action, originalEvent, eventParams) {

			if (!/^(add|remove|toggle|replace)$/.test(action = action.toLowerCase().trim())) {
				throw new TypeError('"' + action + '" is not a valid action.');
			}

			Array.prototype.forEach.call(this, function () {

				var stateName = ;

				element.classList[action](stateName);

				_.save(eventParams, action, originalEvent);

				this.triggerEvent(APRState.getEventName(element, stateKey), eventParams);

			}, this);

			return this;

		},
		'hasState' : function (stateKey) {

			var stateName = _(this).getStateName(stateKey);
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
		},
		'replaceState' : function (stateKey, originalEvent, eventParams) {
			return this.changeState(stateKey, 'replace', originalEvent, eventParams);
		}

	}, {'constructor' : APRState});

	if (!APR.State) {
		APR.State = APRState;
	}

});