var fs = require('fs');
var browserBundle = require('@dist/browser/just.js');
var pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

describe('Browser bundle', function () {

    it('Should export an object called "just".', function () {

        expect(browserBundle).toHaveProperty('just');

    });

    it('Should contain the current version (' + pkg.version + ').', function () {

        expect(browserBundle.just).toHaveProperty('version', pkg.version);

    });

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
        ['getPressedKey'],
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

});
