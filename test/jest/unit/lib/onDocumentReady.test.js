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

        onDocumentReady(fn);

        if (shouldBeCalled) { expect(fn).toHaveBeenCalled(); }
        else { expect(fn).not.toHaveBeenCalled(); }

        readyStateMock.mockRestore();

    });

    it('Should call the given function if DOMContentLoaded is triggered.', function () {

        var fn = jest.fn();
        var addEventListenerMock = jest
            .spyOn(document, 'addEventListener')
            .mockImplementation(function (eventName, listener) {

                expect(eventName).toBe('DOMContentLoaded');
                expect(listener).toBe(fn);

            });
        var readyStateMock = mockReadyState('loading');

        onDocumentReady(fn);

        addEventListenerMock.mockRestore();
        readyStateMock.mockRestore();

    });

});
