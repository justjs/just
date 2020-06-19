var removeEventListener = require('@lib/removeEventListener.js');

describe('@lib/removeEventListener', function () {

	beforeEach(function () { jest.resetAllMocks(); });

	it('Should remove an event listener.', function () {

		var target = document;
		var eventType = 'click';
		var listener = jest.fn();
		var spy = jest.spyOn(target, 'removeEventListener');
		var options;

		removeEventListener(target, eventType, listener, options);

		expect(spy).toHaveBeenCalledWith(eventType, listener, false);

	});

	it('Should remove an event from multiple targets.', function () {

		var targets = [document, window];
		var eventType = 'click';
		var listener = jest.fn();
		var documentSpy = jest.spyOn(document, 'removeEventListener');
		var windowSpy = jest.spyOn(window, 'removeEventListener');
		var options = false;

		removeEventListener(targets, eventType, listener, options);

		expect(documentSpy).toHaveBeenCalledWith(eventType, listener, options);
		expect(windowSpy).toHaveBeenCalledWith(eventType, listener, options);

	});

	it('Should remove multiple events.', function () {

		var target = document;
		var eventTypes = ['click', 'focus'];
		var listener = jest.fn();
		var options = false;
		var spy = jest.spyOn(target, 'removeEventListener');

		removeEventListener(target, eventTypes, listener);

		expect(spy).toHaveBeenCalledTimes(2);
		expect(spy).toHaveBeenNthCalledWith(1, eventTypes[0], listener, options);
		expect(spy).toHaveBeenNthCalledWith(2, eventTypes[1], listener, options);

	});

});
