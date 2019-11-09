var fs = require('fs');
var core = require('@dist/browser/core.js').just;

describe('@dist/browser/core.js', function () {

    test.each([
        ['access'],
        ['prop'],
        ['check'],
        ['is'],
        ['ClassList'],
        ['defaults'],
        ['from'],
        ['Define'],
        ['Def'],
        ['defineProperties'],
        ['defProps'],
        ['defineProperty'],
        ['defProp'],
        ['eachProperty'],
        ['eachProp'],
        ['findElements'],
        ['el'],
        ['getRemoteParent'],
        ['parent'],
        ['isEmptyObject'],
        ['emptyObj'],
        ['isTouchSupported'],
        ['supportsTouch'],
        ['isWindow'],
        ['loadElement'],
        ['load'],
        ['LocalStorage'],
        ['addEventListener'],
        ['on'],
        ['parseUrl'],
        ['stringToJSON'],
        ['toJSON'],
        ['toObjectLiteral'],
        ['toObj']
    ])('Should contain %p as a property.', function (property) {

        expect(core).toHaveProperty(property);

    });

    it('Should distribute minified polyfills apart.', function () {

        expect(fs.existsSync('./dist/browser/polyfills.min.js')).toBe(true);

    });

});
