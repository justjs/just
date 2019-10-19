var findElements = require('@lib/findElements');

describe('@lib/findElements.js', function () {

    it('Should always return an Array.', function () {

        expect(findElements('body')).toMatchObject(expect.any(Array));
        expect(findElements('notFound')).toMatchObject(expect.any(Array));

    });

});
