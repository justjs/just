var isTouchDevice = require('@src/lib/isTouchDevice');

describe('@src/lib/isTouchDevice.js', function () {

    it('Should check for touch support.', function () {

        expect(typeof isTouchDevice()).toBe('boolean');

    });

});
