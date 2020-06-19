var addEventListener = require('@lib/addEventListener.js');

describe('@lib/addEventListener', function () {

    beforeEach(function () { jest.resetAllMocks(); });

    it('Should add an event listener.', function () {

        var target = document;
        var eventType = 'click';
        var listener = jest.fn();
        var spy = jest.spyOn(target, 'addEventListener');
        var expected = [target];
        var options;
        var result;

        result = addEventListener(target, eventType, listener, options);

        expect(result).toEqual(expect.arrayContaining(expected));
        expect(spy).toHaveBeenCalledWith(eventType, listener, false);

    });

    it('Should query elements and add an event listener to each one.', function () {

        var target = 'body, head';
        var eventType = 'click';
        var listener = jest.fn();
        var options = false;
        var body = document.body;
        var head = document.head;
        var bodySpy = jest.spyOn(body, 'addEventListener');
        var headSpy = jest.spyOn(head, 'addEventListener');
        var expected = [body, head];
        var result;

        result = addEventListener(target, eventType, listener, options);

        expect(result).toEqual(expect.arrayContaining(expected));
        expect(bodySpy).toHaveBeenCalledWith(eventType, listener, options);
        expect(headSpy).toHaveBeenCalledWith(eventType, listener, options);

    });

    it('Should add an event to multiple targets.', function () {

        var targets = [document, window];
        var eventType = 'click';
        var listener = jest.fn();
        var documentSpy = jest.spyOn(document, 'addEventListener');
        var windowSpy = jest.spyOn(window, 'addEventListener');
        var options = false;

        addEventListener(targets, eventType, listener, options);

        expect(documentSpy).toHaveBeenCalledWith(eventType, listener, options);
        expect(windowSpy).toHaveBeenCalledWith(eventType, listener, options);

    });

    it('Should add multiple events.', function () {

        var target = document;
        var eventTypes = ['click', 'focus'];
        var listener = jest.fn();
        var options = false;
        var spy = jest.spyOn(target, 'addEventListener');

        addEventListener(target, eventTypes, listener);

        expect(spy).toHaveBeenCalledTimes(2);
        expect(spy).toHaveBeenNthCalledWith(1, eventTypes[0], listener, options);
        expect(spy).toHaveBeenNthCalledWith(2, eventTypes[1], listener, options);

    });

});
