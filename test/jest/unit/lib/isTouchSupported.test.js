var isTouchSupported = require('@lib/isTouchSupported');

describe('@lib/isTouchSupported.js', function () {

    it('Should check for touch support.', function () {

        expect(typeof isTouchSupported()).toBe('boolean');

    });

});
