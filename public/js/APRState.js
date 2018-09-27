APR.Define('APR.State', APR).requires({
	'0.APR.Event' : APR.self.setFileUrl('APREvent', 'js')
}, function (APREvent) {

	'use strict';
	
	var _ = APR.createPrivateKey({

		'getStateName' : function (stateKey) {
			return _isLiteralKey(stateKey) ? stateKey : this.self.getState(stateKey) || '';
		},
		'addStatesToAttribute' : function (states) {
			this.self.element.setAttribute('data-APR-states', JSON.stringify(Object.assign(this.self.getStates(), states)));
		}

	});

	function APRState (element) {

		if (!APR.is(this, APRState)) {
			return new APRState(element);
		}

		this.element = element;
		_(this).self = this;

		APREvent.call(this, element);

	}

	Object.assign(APRState, {
		'findElementsByState' : findElementsByState
	});

	APRState.prototype = Object.assign(Object.create(APREvent.prototype), APRState.prototype, {

		'getStates' : function () {
			return _getStates(this.element);
		},
		'getState' : function (stateKey) {
			return _getStates(this.element)[stateKey];
		},
		'getEventName' : function (stateKey) {
			return 'APRState.' + _(this).getStateName(stateKey).replace(/[\W\_]+/g, '').toLowerCase();
		},
		'listenState' : function (stateKey, handler, eventOptions) {

			var _this = this;

			if (_isLiteralKey(stateKey)) {
				_(this).addStatesToAttribute(APR.setObjectProperties({}, [stateKey, stateKey]));
			}

			this.addCustomEvent(this.getEventName(stateKey), function (e, params) {
				
				var element = this;
				var state = params.state;
				var eventName = e.type;
				
				if (!APR.is(state.action, /^(add|toggle|remove)$/i)) {
					return;
				}

				element.classList[state.action.toLowerCase()](eventName);

				if (APR.is(state.originalEvent, 'undefined')) {
					return;
				}

				params.state = Object.assign(state, {
					'event' : e,
					'target' : element,
					'handler' : handler,
					'action' : state.action,
					'originalEvent' : state.originalEvent,
					'name' : _(_this).getStateName(stateKey),
					'hasIt' : _this.hasState(stateKey)
				});

				handler.call(element, state.originalEvent, params);

			}, eventOptions);

			return this;

		},
		'changeState' : function (stateKey, action, originalEvent, eventParams) {

			this.triggerEvent(this.getEventName(stateKey), Object.assign(APR.get(eventParams, {}), {
				'state' : {
					'action' : action,
					'originalEvent' : originalEvent
				}
			}));

			return this;

		},
		'hasState' : function (stateKey) {
			return this.element.classList.contains(this.getEventName(stateKey));
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

	function findElementsByState (stateKey, parent) {

		var elements = [];

		APR.eachElement(APR.getElements('*[data-APR-states]', parent), function (element) {

			if (APR.inArray(Object.keys(_getStates(element)), stateKey)) {
				elements.push(element);
			}

		});

		return elements;

	}

	function _isLiteralKey (stateKey) {
		return APR.has(stateKey, /^("|').+("|')$/);
	}

	function _getStates (element) {

		var states = element.getAttribute('data-APR-states');
		
		if (!states) {
			throw new TypeError('The element must have a "data-APR-states" attribute.');
		}

		return APR.stringToJSON(states);
	
	}

	if (!APR.State) {
		APR.State = APRState;
	}

});