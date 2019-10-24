var serverBundle = require('@dist/server/just.js');

describe('Server bundle', function () {

    test.each([
        ['access'],
        ['prop'],
        ['check'],
        ['is'],
        ['defaults'],
        ['from'],
        ['defineProperties'],
        ['defProps'],
        ['defineProperty'],
        ['defProp'],
        ['eachProperty'],
        ['eachProp'],
        ['isEmptyObject'],
        ['emptyObj'],
        ['parseUrl'],
        ['stringToJSON'],
        ['toJSON'],
        ['toObjectLiteral'],
        ['toObj']
    ])('Should contain %p as a property.', function (property) {

        expect(serverBundle.just).toHaveProperty(property);

    });

});
