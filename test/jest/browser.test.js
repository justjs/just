var browser = require('@src/browser');

describe('@src/browser.js', function () {

    it('Should return a Common JS module.', function () {

        expect(browser).toMatchObject({});

    });

});
