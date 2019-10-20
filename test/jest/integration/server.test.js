var fs = require('fs');
var serverBundle = require('@dist/server/just.js');
var pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

describe('Server bundle', function () {

    it('Should export an object called "just".', function () {

        expect(serverBundle).toHaveProperty('just');

    });

    it('Should contain the current version (' + pkg.version + ').', function () {

        expect(serverBundle.just).toHaveProperty('version', pkg.version);

    });

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
