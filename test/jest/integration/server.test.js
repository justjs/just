var core = require('@dist/server/core.js').just;

describe('@dist/server/core.js', function () {

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

        expect(core).toHaveProperty(property);

    });

});
