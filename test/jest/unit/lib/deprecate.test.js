var deprecate = require('@lib/deprecate');

afterEach(function () {

    jest.clearAllMocks();

});

describe('@lib/deprecate', function () {

    var consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(function () {});
    var consoleWarnMock = jest.spyOn(console, 'warn').mockImplementation(function () {});

    it('Should log an error in the console.', function () {

        deprecate('.deprecate()');
        expect(consoleErrorMock).toHaveBeenCalled();

    });

    it('Should show a warning in the console.', function () {

        deprecate('.deprecate()', 'warning');
        expect(consoleWarnMock).toHaveBeenCalled();

    });

    it('Should throw an Error.', function () {

        expect(function () {

            deprecate('.deprecate()', 'error');

        }).toThrow(Error);

    });

    it('Should show the version when it was deprecated.', function () {


        deprecate('.deprecate()', null, {
            'since': 'v1.0.0'
        });
        expect(consoleErrorMock).toHaveBeenCalledWith(
            'just.deprecate() is deprecated since v1.0.0.'
        );

    });

    it('Should append a custom message.', function () {

        deprecate('.deprecate()', null, {
            'message': 'My message.'
        });
        expect(consoleErrorMock).toHaveBeenCalledWith(
            'just.deprecate() is deprecated. My message.'
        );

    });

    it('Should show when it was deprecated and a custom message.', function () {

        deprecate('.deprecate()', null, {
            'since': 'v1.0.0',
            'message': 'My message.'
        });
        expect(consoleErrorMock).toHaveBeenCalledWith(
            'just.deprecate() is deprecated since v1.0.0. My message.'
        );

    });

});
