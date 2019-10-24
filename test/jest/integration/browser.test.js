var fs = require('fs');
var browserBundle = require('@dist/browser/just.js');

describe('Browser bundle', function () {

    test.each([
        ['access'],
        ['check'],
        ['ClassList'],
        ['defaults'],
        ['Define'],
        ['defineProperties'],
        ['defineProperty'],
        ['eachProperty'],
        ['findElements'],
        ['getRemoteParent'],
        ['isEmptyObject'],
        ['isTouchSupported'],
        ['isWindow'],
        ['loadElement'],
        ['LocalStorage'],
        ['addEventListener'],
        ['parseUrl'],
        ['stringToJSON'],
        ['toObjectLiteral'],
    ])('Should contain %p as a property.', function (property) {

        expect(browserBundle.just).toHaveProperty(property);

    });

    it('Should distribute minified polyfills apart.', function () {

        expect(fs.existsSync('./dist/browser/polyfills.min.js')).toBe(true);

    });

});
