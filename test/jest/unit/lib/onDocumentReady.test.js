var onDocumentReady = require('@lib/onDocumentReady');

describe('@lib/onDocumentReady', function () {

    var mockReadyState = function (value) {

        return jest
            .spyOn(document, 'readyState', 'get')
            .mockImplementation(function () { return value; });

    };

    test.each([
        ['complete', true],
        ['interactive', true],
        ['loading', false]
    ])('Should call the given function if the document is not loading.', function (
        readyState, shouldBeCalled) {

        var fn = jest.fn();
        var readyStateMock = mockReadyState(readyState);
        var setTimeoutMock = jest.spyOn(window, 'setTimeout').mockImplementation(
            function (cb) { expect(cb).toBe(fn); }
        );

        expect.assertions(1);

        onDocumentReady(fn);

        if (!shouldBeCalled) { expect(fn).not.toHaveBeenCalled(); }

        readyStateMock.mockRestore();
        setTimeoutMock.mockRestore();

    });

    it('Should call the given function if DOMContentLoaded is triggered ' +
    'and remove the event listener.', function () {

        var fn = jest.fn();
        var removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
        var readyStateMock = mockReadyState('loading');
        var addEventListenerMock = jest
            .spyOn(document, 'addEventListener')
            .mockImplementation(function (eventName, fn) { fn(); });

        onDocumentReady(fn);

        expect(addEventListenerMock).toHaveBeenCalled();
        expect(removeEventListenerSpy).toHaveBeenCalled();
        expect(fn).toHaveBeenCalled();

        addEventListenerMock.mockRestore();
        removeEventListenerSpy.mockRestore();
        readyStateMock.mockRestore();

    });

});
