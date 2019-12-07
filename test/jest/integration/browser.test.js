var fs = require('fs');
var browserBundle = require('@dist/browser/just.js');

describe('Browser bundle', function () {

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

        expect(browserBundle.just).toHaveProperty(property);

    });

    it('Should distribute minified polyfills apart.', function () {

        expect(fs.existsSync('./dist/browser/polyfills.min.js')).toBe(true);

    });

});
