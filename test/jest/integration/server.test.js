var serverBundle = require('@dist/server/just.js');

describe('Server bundle', function () {

    test.each([
        ['access'],
        ['check'],
        ['defaults'],
        ['defineProperties'],
        ['defineProperty'],
        ['eachProperty'],
        ['isEmptyObject'],
        ['parseUrl'],
        ['stringToJSON'],
        ['toObjectLiteral']
    ])('Should contain %p as a property.', function (property) {

        expect(serverBundle.just).toHaveProperty(property);

    });

});
