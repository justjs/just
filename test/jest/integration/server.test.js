/** @jest-environment node */

describe('Server', function () {

    var members = [
        ['core', expect.any(Object)],
        ['assign', expect.any(Function)],
        ['deprecate', expect.any(Function)],
        ['access', expect.any(Function)],
        ['prop', expect.any(Function)],
        ['check', expect.any(Function)],
        ['is', expect.any(Function)],
        ['defaults', expect.any(Function)],
        ['from', expect.any(Function)],
        ['defineProperties', expect.any(Function)],
        ['defProps', expect.any(Function)],
        ['defineProperty', expect.any(Function)],
        ['defProp', expect.any(Function)],
        ['eachProperty', expect.any(Function)],
        ['eachProp', expect.any(Function)],
        ['isEmptyObject', expect.any(Function)],
        ['emptyObj', expect.any(Function)],
        ['stringToJSON', expect.any(Function)],
        ['toJSON', expect.any(Function)],
        ['toObjectLiteral', expect.any(Function)],
        ['toObj', expect.any(Function)],
        ['parseJSON', expect.any(Function)]
    ];

    test.each(members)('Should export %s', function (memberName, expected) {

        var member = require('@dist/server/' + memberName + '.js');

        expect(member).toEqual(expected);

    });

    describe('index', function () {

        var just = require('@dist/server');

        test.each(members)('Should contain %s', function (memberName, expected) {

            expect(just).toHaveProperty(memberName);
            expect(just[memberName]).toEqual(expected);

        });

    });

});
