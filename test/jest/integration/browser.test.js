/** @jest-environment jsdom */

var fs = require('fs');

describe('Core', function () {

    test.each([
        ['@dist/browser/core.js'],
        ['@dist/browser/core.min.js']
    ])('%s should contain all members.', function (src) {

        var core = require(src).just;

        expect(core).toEqual(expect.objectContaining({
            'access': expect.any(Function),
            'prop': expect.any(Function),
            'check': expect.any(Function),
            'is': expect.any(Function),
            'ClassList': expect.any(Function),
            'defaults': expect.any(Function),
            'from': expect.any(Function),
            'Define': expect.any(Function),
            'Def': expect.any(Function),
            'defineProperties': expect.any(Function),
            'defProps': expect.any(Function),
            'defineProperty': expect.any(Function),
            'defProp': expect.any(Function),
            'eachProperty': expect.any(Function),
            'eachProp': expect.any(Function),
            'findElements': expect.any(Function),
            'el': expect.any(Function),
            'getRemoteParent': expect.any(Function),
            'parent': expect.any(Function),
            'isEmptyObject': expect.any(Function),
            'emptyObj': expect.any(Function),
            'isTouchSupported': expect.any(Function),
            'supportsTouch': expect.any(Function),
            'isWindow': expect.any(Function),
            'loadElement': expect.any(Function),
            'load': expect.any(Function),
            'LocalStorage': expect.any(Function),
            'addEventListener': expect.any(Function),
            'on': expect.any(Function),
            'parseUrl': expect.any(Function),
            'stringToJSON': expect.any(Function),
            'toJSON': expect.any(Function),
            'toObjectLiteral': expect.any(Function),
            'toObj': expect.any(Function)
        }));

    });

});

describe('@dist/browser/polyfills-es5.min.js', function () {

    it('Should distribute minified polyfills apart.', function () {

        expect(fs.existsSync('./dist/browser/polyfills-es5.min.js')).toBe(true);

    });

});
