APR.Define('APR.GlobalEvent').requires({
	'0.APR.Element' : APR.self.setFileUrl('APRElement', 'js')
}, function (APRElement) {

	'use strict';

	function APRGlobalEvent (element) {
		this.element = element;
	}

	APRGlobalEvent.callAttachedHandlers = function (target, events, bubblingEvent, fnParams) {

		APR.eachProperty(events, function (fn, name) {

			if (
				(name[0] === '#' && target.id === name.slice(1)) ||
				(name[0] === '.' && target.hasClass(name)) ||
				(/\w/.test(name[0]) && name.toUpperCase() === target.tagName)
			) {
				fn.call(target, bubblingEvent, fnParams);
			}

		});

	};

	APRGlobalEvent.prototype.set = function setEvents (bubblingEvents, commonOptions) {
		
		var globalEventHandler = function globalEventHandler (e, params) {
			// FIX: To check if bubbling events trigger the parent-element's events.
			// APRGlobalEvent.callAttachedHandlers(APRElement(e.target), params[e.type], e, params);
			var element = e.target;

			while (element && element.tagName !== 'BODY') {
				APRGlobalEvent.callAttachedHandlers(APRElement(element), params[e.type], e, commonOptions.params);
				element = element.parentNode;
			}

		};
		var options = {
			'params' : bubblingEvents,
			'isBubblingEvent' : true
		};

		if (typeof commonOptions !== 'object') {
			commonOptions = {};
		}

		APR.eachProperty.call(this, bubblingEvents, function (_, eventType) {
			this.element.setEvent(eventType, globalEventHandler, options);
		});

		return this;
	
	};

	if (!APR.GlobalEvent) {
		APR.GlobalEvent = APRGlobalEvent;
	}

});