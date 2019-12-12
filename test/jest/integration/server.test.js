/** @jest-environment node */

describe('Core', function () {

    test.each([
        ['@dist/server/core.js'],
        ['@dist/server/core.min.js']
    ])('%s should contain all members.', function (src) {

        var core = require(src).just;

        expect(core).toEqual(expect.objectContaining({
            'access': expect.any(Function),
            'prop': expect.any(Function),
            'check': expect.any(Function),
            'is': expect.any(Function),
            'defaults': expect.any(Function),
            'from': expect.any(Function),
            'defineProperties': expect.any(Function),
            'defProps': expect.any(Function),
            'defineProperty': expect.any(Function),
            'defProp': expect.any(Function),
            'eachProperty': expect.any(Function),
            'eachProp': expect.any(Function),
            'isEmptyObject': expect.any(Function),
            'emptyObj': expect.any(Function),
            'parseUrl': expect.any(Function),
            'stringToJSON': expect.any(Function),
            'toJSON': expect.any(Function),
            'toObjectLiteral': expect.any(Function),
            'toObj': expect.any(Function)
        }));

    });

    test.each([
        ['@dist/server/core.js'],
        ['@dist/server/core.min.js']
    ])('Should return "just"', function (src) {

        expect(require(src)).toBe(require(src).just);

    });

});
