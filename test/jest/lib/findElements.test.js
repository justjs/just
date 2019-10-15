var findElements = require('@src/lib/findElements');

describe('@src/lib/findElements.js', function () {

    it('Should always return an Array.', function () {

        expect(findElements('body')).toMatchObject(expect.any(Array));
        expect(findElements('notFound')).toMatchObject(expect.any(Array));

    });

});
