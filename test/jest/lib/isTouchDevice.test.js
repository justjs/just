var isTouchDevice = require('@lib/isTouchDevice');

describe('@lib/isTouchDevice.js', function () {

    it('Should check for touch support.', function () {

        expect(typeof isTouchDevice()).toBe('boolean');

    });

});
